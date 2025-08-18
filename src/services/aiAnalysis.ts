import type { ResumeData, JobDescription, InterviewQuestion, PresentationTopic, ATSScore } from '../types';

// Real AI Analysis Service using OpenAI GPT
export class AIAnalysisService {
  private static async callOpenAI(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      const response = await fetch('/.netlify/functions/ai-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert career coach and HR professional with 15+ years of experience helping candidates prepare for technical interviews. Always provide specific, actionable advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI service error: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async calculateATSScore(
    resume: ResumeData,
    job: JobDescription
  ): Promise<ATSScore> {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. 
      
TASK: Analyze the following resume against the job requirements and calculate an ATS compatibility score.

RESUME INFORMATION:
- Skills: ${resume.skills.join(', ')}
- Experience: ${resume.experience?.map(exp => exp.description.join(', ')).join(' ') || 'No experience listed'}
- Education: ${resume.education?.map(edu => `${edu.degree} at ${edu.school}`).join('; ') || 'Not specified'}

JOB REQUIREMENTS:
- Required Skills: ${job.requirements.join(', ')}
- Preferred Skills: ${job.preferredSkills?.join(', ') || 'None specified'}

INSTRUCTIONS:
1. Calculate an ATS score from 0-100 based on how well the resume matches the job requirements
2. Provide specific strengths in the candidate's profile
3. List actionable improvements to increase ATS score
4. Identify matched and missing keywords

RESPONSE FORMAT (must be valid JSON):
{
  "score": 75,
  "strengths": ["string"],
  "improvements": ["string"],
  "keywordMatches": ["string"],
  "missingKeywords": ["string"]
}

IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.`;

    try {
      const response = await this.callOpenAI(prompt, 2000);
      
      // Clean up the response to extract just the JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```(?:json)?\s*|```/g, '').trim();
      
      // Try to find JSON object in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      try {
        const result = JSON.parse(cleanResponse);
        
        // Validate and ensure all required fields exist with proper types
        return {
          score: typeof result.score === 'number' ? Math.max(0, Math.min(100, result.score)) : 0,
          strengths: Array.isArray(result.strengths) ? result.strengths : [],
          improvements: Array.isArray(result.improvements) ? result.improvements : [],
          keywordMatches: Array.isArray(result.keywordMatches) ? result.keywordMatches : [],
          missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : []
        };
      } catch (jsonError) {
        console.error('Failed to parse ATS response as JSON. Response:', cleanResponse);
        console.error('JSON Parse Error:', jsonError);
        return this.getMockATSScore();
      }
    } catch (error) {
      console.error('Error in calculateATSScore:', error);
      return this.getMockATSScore();
    }
  }
  static async analyzeResume(resumeText: string): Promise<ResumeData> {
    const prompt = `
Analyze this resume and extract structured information. Return a JSON object with the following structure:
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "summary": "string (2-3 sentences)",
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "duration": "string",
      "description": ["string array of 3-4 key achievements"]
    }
  ],
  "skills": ["array of technical skills"],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "year": "string"
    }
  ],
  "certifications": ["array of certifications if any"]
}

Resume text:
${resumeText}

Return only valid JSON without any additional text or formatting.`;

    try {
      const response = await this.callOpenAI(prompt, 1500);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Resume analysis failed:', error);
      // Fallback to mock data if AI fails
      return this.getMockResumeData();
    }
  }
  static async analyzeJobDescription(jobText: string): Promise<JobDescription> {
    const prompt = `
Analyze this job posting and extract structured information. Return a JSON object with:
{
  "title": "string",
  "company": "string",
  "requirements": ["array of key requirements"],
  "responsibilities": ["array of main responsibilities"], 
  "preferredSkills": ["array of preferred/nice-to-have skills"],
  "description": "original text"
}

Job posting:
${jobText}

Return only valid JSON without any additional text.`;

    try {
      const response = await this.callOpenAI(prompt, 1200);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(cleanResponse);
      parsed.description = jobText; // Keep original text
      return parsed;
    } catch (error) {
      console.error('Job analysis failed:', error);
      return this.getMockJobDescription(jobText);
    }
  }
  static async generateInterviewResponse(
    userResponse: string,
    currentQuestion: string,
    resume: ResumeData,
    conversationHistory: string[]
  ): Promise<string> {
    try {
      const prompt = `You are conducting a technical interview. The candidate's resume shows experience with: ${JSON.stringify(resume.skills || [])}
      
Current interview question: "${currentQuestion}"
      
Candidate's response: "${userResponse}"
      
Conversation history so far:
${conversationHistory.join('\n')}
      
Provide constructive feedback on the candidate's response, then ask a follow-up question or move to the next question.`;

      return await this.callOpenAI(prompt);
    } catch (error) {
      console.error('Error generating interview response:', error);
      return "Thank you for your response. Let's move on to the next question.";
    }
  }

  static async generateInterviewQuestions(
    resume: ResumeData,
    job: JobDescription
  ): Promise<InterviewQuestion[]> {
    const prompt = `
Based on this resume and job description, generate 6 personalized interview questions.

Resume Summary:
- Name: ${resume.name}
- Experience: ${resume.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}
- Skills: ${resume.skills.join(', ')}

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Requirements: ${job.requirements.join(', ')}

Generate questions that:
1. Test technical skills relevant to both resume and job
2. Explore behavioral situations from their experience
3. Assess problem-solving for the specific role
4. Reference specific companies/technologies from their background

Return JSON array:
[
  {
    "id": "string",
    "type": "technical|behavioral|situational",
    "question": "string (specific question referencing their experience)",
    "suggestedAnswer": "string (detailed answer strategy)",
    "tips": ["array of 3-4 specific tips"]
  }
]

Make questions specific to their background at ${resume.experience[0]?.company} and the ${job.title} role.`;

    try {
      const response = await this.callOpenAI(prompt, 2000);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Question generation failed:', error);
      return this.getMockQuestions();
    }
  }
  static async generatePresentationTopics(
    resume: ResumeData,
    job: JobDescription
  ): Promise<PresentationTopic[]> {
    try {
      const prompt = `Generate 3 presentation topics based on the following resume and job description. 
      For each topic, include a title and 3-5 bullet points.
      
      Resume:
      ${JSON.stringify(resume, null, 2)}
      
      Job Description:
      ${JSON.stringify(job, null, 2)}
      
      Format the response as a valid JSON array of objects with properties: id, title, and bullets (array).
      Example format:
      [
        {
          "id": "topic1",
          "title": "Presentation Title 1",
          "bullets": ["Point 1", "Point 2", "Point 3"]
        }
      ]`;

      const response = await this.callOpenAI(prompt, 1000);
      
      // Clean the response
      const cleanResponse = response
        .replace(/^```(?:json)?\s*|\s*```$/g, '') // Remove code block markers
        .trim();
      
      // Try to parse the response directly first
      try {
        const parsed = JSON.parse(cleanResponse);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = cleanResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse extracted JSON:', e);
          }
        }
        console.error('Failed to parse presentation response:', e);
        console.log('Raw response:', response);
        return this.getMockPresentations();
      }
    } catch (error) {
      console.error('Presentation generation failed:', error);
      return this.getMockPresentations();
    }
  }

  // Fallback mock data methods
  private static getMockPresentations(): PresentationTopic[] {
    return [
      {
        id: '1',
        title: 'The Future of Web Development',
        bullets: [
          'Emerging technologies in 2024',
          'Best practices for modern web apps',
          'Case studies of innovative web apps',
          'Predictions for the next 5 years'
        ]
      },
      {
        id: '2',
        title: 'Building Scalable Frontend Architecture',
        bullets: [
          'Micro-frontends vs monoliths',
          'State management strategies',
          'Performance optimization techniques',
          'Challenges and solutions',
          'Real-world implementation examples'
        ]
      }
    ];
  }

  private static getMockATSScore(): ATSScore {
    return {
      score: 78,
      strengths: [
        'Strong experience with React and TypeScript',
        'Good understanding of cloud platforms',
        'Experience with CI/CD pipelines'
      ],
      improvements: [
        'Add more specific metrics to quantify achievements',
        'Include more industry-specific keywords',
        'Highlight leadership experience more prominently'
      ],
      keywordMatches: ['React', 'TypeScript', 'AWS', 'Docker', 'CI/CD'],
      missingKeywords: ['GraphQL', 'Microservices', 'Kubernetes']
    };
  }

  private static getMockResumeData(): ResumeData {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(123) 456-7890',
      summary: 'Experienced software engineer with 5+ years of experience in web development.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'],
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          duration: '2020 - Present',
          description: [
            'Developed and maintained web applications using React and Node.js',
            'Led a team of 5 developers to deliver key features'
          ]
        }
      ],
      education: [
        {
          school: 'University of Technology',
          degree: 'B.Sc. in Computer Science',
          year: '2015 - 2019'
        }
      ]
    };
  }

  private static getMockJobDescription(jobText: string): JobDescription {
    return {
      title: 'Senior Frontend Developer',
      company: 'Innovate Inc',
      description: jobText || 'Looking for an experienced frontend developer...',
      requirements: [
        '5+ years of experience with React',
        'Strong TypeScript skills',
        'Experience with modern frontend tooling'
      ],
      responsibilities: [
        'Develop and maintain high-quality frontend code',
        'Collaborate with design and backend teams'
      ],
      preferredSkills: ['GraphQL', 'AWS', 'Docker']
    };
  }

  private static getMockQuestions(): InterviewQuestion[] {
    return [
      {
        id: '1',
        type: 'technical',
        question: 'Can you explain how you would optimize a React application for better performance?',
        suggestedAnswer: 'I would use techniques like code splitting, lazy loading, memoization...',
        tips: ['Focus on specific React optimizations', 'Mention tools like React.memo and useCallback']
      },
      {
        id: '2',
        type: 'behavioral',
        question: 'Tell me about a time you had to work with a difficult team member.',
        suggestedAnswer: 'In my previous role, I worked with a colleague who...',
        tips: ['Be diplomatic', 'Focus on the resolution']
      }
    ];
  }
}
