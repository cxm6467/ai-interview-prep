// Import mammoth for Word document parsing
import mammoth from 'mammoth';

// This function will be used to dynamically import PDF.js
async function getPdfJs() {
  // Import PDF.js with proper typing
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  
  // Import worker with proper typing
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
  
  // Set worker source
  if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
  }
  
  return pdfjsLib;
}

export class DocumentParser {
  static async parseResume(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword' ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc')
      ) {
        return await this.parseWord(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or Word document.');
      }
    } catch (error) {
      console.error('Error parsing document:', error);
      // Return mock text for demo purposes if parsing fails
      return this.getMockResumeText(fileName);
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    try {
      const pdfjsLib = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText || this.getMockResumeText(file.name);
    } catch (error) {
      console.error('PDF parsing failed:', error);
      return this.getMockResumeText(file.name);
    }
  }

  private static async parseWord(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || this.getMockResumeText(file.name);
    } catch (error) {
      console.error('Word parsing failed:', error);
      return this.getMockResumeText(file.name);
    }
  }

  private static getMockResumeText(fileName: string): string {
    return `
# Resume - ${fileName}

John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

## Experience
Senior Full Stack Developer at Tech Corp (2021-Present)
- Led development of React applications with TypeScript
- Built scalable Node.js APIs serving 100k+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored team of 5 junior developers

Full Stack Developer at StartupXYZ (2019-2021)
- Developed React front-end with modern hooks and context
- Created RESTful APIs with Express and PostgreSQL
- Integrated third-party payment systems
- Optimized database queries improving performance by 40%

## Skills
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, AWS, Docker, Git, Redux, GraphQL, REST APIs, Jest, Cypress

## Education
Bachelor of Science in Computer Science
State University (2015-2019)

## Certifications
AWS Certified Developer Associate (2022)
Google Cloud Professional Developer (2021)
    `.trim();
  }

  static async fetchJobDescription(input: string): Promise<string> {
    if (!input.startsWith('http')) {
      input = 'https://' + input;
    }
    
    try {
      console.log('Would fetch job description from:', input);
      
      // Return mock job description for demo
      return `
# Senior Full Stack Developer - Amazing Tech Co

## About the Role
We are seeking a talented Senior Full Stack Developer to join our growing engineering team. You will be responsible for building scalable web applications and leading technical initiatives.

## Requirements
- 5+ years of experience with React and modern JavaScript
- Strong expertise in Node.js and Express
- Experience with PostgreSQL or similar databases
- AWS cloud services knowledge
- Understanding of RESTful API design
- Experience with Git version control

## Responsibilities
- Design and develop scalable full-stack applications
- Lead technical architecture decisions
- Mentor junior developers and conduct code reviews
- Collaborate with product and design teams
- Implement best practices for testing and deployment

## Preferred Skills
- TypeScript experience
- GraphQL knowledge
- Docker and containerization
- CI/CD pipeline experience
- Microservices architecture
- Redis or similar caching solutions

## Benefits
- Competitive salary and equity
- Health, dental, and vision insurance
- Unlimited PTO
- Remote-friendly culture
- Professional development budget
      `.trim();
    } catch (error) {
      console.error('Error fetching URL:', error);
      throw new Error('Failed to fetch job description from URL. Please try uploading a file instead.');
    }
  }
}
