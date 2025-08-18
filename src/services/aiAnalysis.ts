import type { ResumeData, JobDescription, InterviewQuestion, PresentationTopic, ATSScore } from '@types';

// Real AI Analysis Service using OpenAI GPT
export class AIAnalysisService {
  private static getOpenAIKey(): string {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.');
    }
    return key;
  }

  private static async callOpenAI(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getOpenAIKey()}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const prompt = `
Create 3 presentation topics for a ${job.title} interview based on the candidate's background.

Candidate Experience:
${resume.experience.map(exp => `- ${exp.position} at ${exp.company}: ${exp.description.join(', ')}`).join('\n')}

Skills: ${resume.skills.join(', ')}

Job Requirements: ${job.requirements.join(', ')}

Return JSON array:
[
  {
    "id": "string",
    "title": "string (engaging presentation title)",
    "bullets": ["array of 6-8 detailed bullet points"],
    "relevance": number (0-100)
  }
]

Make topics highly relevant to their actual experience and the target role.`;

    try {
      const response = await this.callOpenAI(prompt, 1500);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Presentation generation failed:', error);
      return this.getMockPresentations();
    }
  }

  static async calculateATSScore(
    resume: ResumeData,
    job: JobDescription
  ): Promise<ATSScore> {
    const prompt = `
Analyze this resume against the job requirements for ATS optimization.

Resume Skills: ${resume.skills.join(', ')}
Resume Experience: ${resume.experience.map(exp => exp.description.join(', ')).join(' ')}

Job Requirements: ${job.requirements.join(', ')}
Preferred Skills: ${job.preferredSkills.join(', ')}

Calculate an ATS score (0-100) and provide specific feedback:

{
  "score": number,
  "strengths": ["array of specific strengths"],
  "improvements": ["array of actionable improvements"],
  "keywordMatches": ["array of matched keywords"],
  "missingKeywords": ["array of important missing keywords"]
}

Be specific about what keywords are present vs missing and why.`;

    try {
      const response = await this.callOpenAI(prompt, 1200);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('ATS analysis failed:', error);
      return this.getMockATSScore();
    }
  }

  // Enhanced AI Interview Chat Response
  static async generateInterviewResponse(
    userMessage: string,
    questionContext: any,
    resumeData: ResumeData,
    conversationHistory: string[]
  ): Promise<string> {
    const prompt = `
You are conducting a mock interview for a ${resumeData.experience[0]?.position || 'software developer'} position.

Candidate Background:
- Current/Recent Role: ${resumeData.experience[0]?.position} at ${resumeData.experience[0]?.company}
- Skills: ${resumeData.skills.join(', ')}

Current Question Context: ${questionContext?.question || 'General conversation'}
Question Type: ${questionContext?.type || 'general'}

Conversation History:
${conversationHistory.slice(-3).join('\n')}

Candidate's Response: "${userMessage}"

As an experienced interviewer:
1. Provide specific feedback on their answer
2. Ask relevant follow-up questions if appropriate
3. Reference their actual experience when giving advice
4. Keep response conversational but professional
5. Limit response to 2-3 sentences

Response:`;

    try {
      const response = await this.callOpenAI(prompt, 300);
      return response.trim();
    } catch (error) {
      console.error('Interview response generation failed:', error);
      return "Thank you for that response. Could you provide more specific details about your experience with this technology?";
    }
  }

  // Fallback mock data methods
  private static getMockResumeData(): ResumeData {
    return {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      summary: 'Experienced full-stack developer with strong technical skills in modern web technologies',
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          duration: '2021-Present',
          description: ['Led development of React applications', 'Mentored junior developers']
        }
      ],
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
      education: [
        {
          degree: 'Computer Science',
          school: 'State University',
          year: '2019'
        }
      ],
      certifications: []
    };
  }

  private static getMockJobDescription(jobText: string): JobDescription {
    return {
      title: 'Senior Full Stack Developer',
      company: 'Amazing Tech Co',
      requirements: ['5+ years React experience', 'Node.js expertise', 'AWS knowledge'],
      responsibilities: ['Build scalable applications', 'Lead development team'],
      preferredSkills: ['TypeScript', 'GraphQL', 'Docker'],
      description: jobText
    };
  }

  private static getMockQuestions(): InterviewQuestion[] {
    return [
      {
        id: '1',
        type: 'technical',
        question: 'Tell me about your experience with React and modern JavaScript.',
        suggestedAnswer: 'Focus on your specific projects and technical challenges you\'ve solved.',
        tips: ['Mention specific projects', 'Discuss performance optimizations']
      }
    ];
  }

  private static getMockPresentations(): PresentationTopic[] {
    return [
      {
        id: '1',
        title: 'Modern Web Development',
        bullets: ['Component architecture', 'State management', 'Performance optimization'],
        relevance: 90
      }
    ];
  }

  private static getMockATSScore(): ATSScore {
    return {
      score: 75,
      strengths: ['Technical skills match'],
      improvements: ['Add more keywords'],
      keywordMatches: ['React', 'JavaScript'],
      missingKeywords: ['Docker', 'GraphQL']
    };
  }
}
