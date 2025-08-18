export declare class DocumentParser {
    static parseResume(file: File): Promise<string>;
    private static parsePDF;
    private static parseWord;
    private static getMockResumeText;
    static fetchJobDescription(input: string): Promise<string>;
}
