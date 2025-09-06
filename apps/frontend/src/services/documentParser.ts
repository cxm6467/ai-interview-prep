import { createLogger } from '@/utils/logger';
import { fileCacheService } from './fileCacheService';
import * as pdfjsLib from 'pdfjs-dist';

const logger = createLogger('DocumentParser');

// Dynamic import for Word document parsing to reduce initial bundle size
async function getMammoth() {
  logger.debug('Loading Mammoth library for Word document parsing');
  const mammoth = await import('mammoth');
  logger.success('Mammoth library loaded successfully');
  return mammoth.default;
}

// Initialize PDF.js worker on module load
function initializePdfJs() {
  logger.debug('Initializing PDF.js library');
  
  try {
    // Set worker source for pdfjs-dist v5.x compatible with Vite
    if (typeof window !== 'undefined') {
      // Use CDN worker for development and production to avoid bundling issues
      const workerSrc = `https://unpkg.com/pdfjs-dist@5.4.54/build/pdf.worker.min.mjs`;
      
      // Check if GlobalWorkerOptions exists and set it
      if (pdfjsLib && 'GlobalWorkerOptions' in pdfjsLib) {
        (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerSrc;
        logger.debug('PDF.js worker configured via GlobalWorkerOptions', { workerSrc });
      } else {
        logger.warn('GlobalWorkerOptions not found in pdfjs-dist');
      }
    }
    
    logger.success('PDF.js library initialized successfully');
    return pdfjsLib;
  } catch (error) {
    logger.error('Failed to initialize PDF.js library', { error: error instanceof Error ? error.message : String(error) });
    throw new Error(`PDF.js library could not be initialized: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Initialize PDF.js on module load
const pdfJs = initializePdfJs();

export class DocumentParser {
  static async parseResume(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const parseLogger = logger.child({ fileId, fileName, fileType, fileSize: file.size });

    parseLogger.file('Starting document parsing', { fileName, fileType, fileSize: `${(file.size / 1024).toFixed(2)}KB` });

    // Check cache first
    const cachedContent = await fileCacheService.getFromCache(file);
    if (cachedContent) {
      parseLogger.info('File content found in cache', { cacheHit: true });
      return cachedContent;
    }

    parseLogger.info('File not in cache, parsing content', { cacheHit: false });
    const parseStartTime = performance.now();

    try {
      let parsedContent: string;
      
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        parseLogger.info('Parsing PDF document');
        parsedContent = await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword' ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc')
      ) {
        parseLogger.info('Parsing Word document');
        parsedContent = await this.parseWord(file);
      } else {
        parseLogger.validationError('Unsupported file type', { supportedTypes: ['PDF', 'DOC', 'DOCX'] });
        throw new Error('Unsupported file type. Please upload PDF or Word document.');
      }

      // Cache the parsed content
      const parseTime = performance.now() - parseStartTime;
      await fileCacheService.addToCache(file, parsedContent);
      
      parseLogger.success('Document parsing completed and cached', { 
        parseTime: `${parseTime.toFixed(2)}ms`,
        contentLength: parsedContent.length 
      });

      return parsedContent;
    } catch (error) {
      parseLogger.parseError('Document parsing failed', undefined, undefined, error as Error);
      
      // Re-throw the error with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during parsing';
      throw new Error(`Failed to parse ${fileName}: ${errorMessage}`);
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfJs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => {
            const textItem = item as { str?: string };
            return (textItem && typeof textItem.str === 'string') ? textItem.str : '';
          })
          .filter((str: string) => str.length > 0)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (!fullText.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }
      return fullText;
    } catch (error) {
      console.error('PDF parsing failed:', error);
      throw error;
    }
  }

  private static async parseWord(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await getMammoth();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || !result.value.trim()) {
        throw new Error('No text could be extracted from the Word document');
      }
      
      return result.value;
    } catch (error) {
      console.error('Word parsing failed:', error);
      throw error;
    }
  }
}
