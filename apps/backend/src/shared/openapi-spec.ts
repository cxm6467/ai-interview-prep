/**
 * OpenAPI 3.0 specification for AI Interview Prep API
 * This specification defines all endpoints and their schemas for the API
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "AI Interview Prep API",
    description: `
# AI Interview Prep API

A comprehensive API for AI-powered interview preparation, providing resume analysis, job description matching, and interactive interview coaching.

## Features

- **Resume Analysis**: Extract structured data from resumes
- **ATS Score Calculation**: Analyze resume compatibility with job descriptions
- **Interview Questions**: Generate personalized technical and behavioral questions
- **Interactive Coaching**: Real-time interview practice with AI feedback
- **Presentation Topics**: Create relevant presentation ideas

## Authentication

Currently, this API does not require authentication. All endpoints are publicly accessible.

## Rate Limiting

API Gateway enforces standard rate limits. Please be mindful of usage patterns.
    `,
    version: "1.0.0",
    contact: {
      name: "AI Interview Prep API Support",
      url: "https://github.com/cxm6467/ai-interview-prep"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  servers: [
    {
      url: "https://api.develop.ai-ip.chrismarasco.io",
      description: "Development server"
    },
    {
      url: "https://api.ai-ip.chrismarasco.io", 
      description: "Production server"
    }
  ],
  paths: {
    "/": {
      get: {
        summary: "API Health Check and Information",
        description: "Returns API status, version, and available endpoints",
        operationId: "getApiInfo",
        tags: ["Health"],
        responses: {
          "200": {
            description: "API information and health status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    message: {
                      type: "string",
                      example: "AI Interview Prep API"
                    },
                    version: {
                      type: "string",
                      example: "1.0.0"
                    },
                    endpoints: {
                      type: "object",
                      properties: {
                        analyze: {
                          type: "string",
                          example: "POST /analyze - Analyze resume and job description"
                        },
                        chat: {
                          type: "string", 
                          example: "POST /chat - Interactive interview coaching"
                        },
                        health: {
                          type: "string",
                          example: "GET / - API health check"
                        }
                      }
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2025-09-01T17:47:16.177Z"
                    }
                  },
                  required: ["success", "message", "version", "endpoints", "timestamp"]
                }
              }
            }
          }
        }
      }
    },
    "/analyze": {
      post: {
        summary: "Analyze Resume and Job Description",
        description: "Performs comprehensive analysis of a resume against a job description, including ATS scoring, question generation, and recommendations",
        operationId: "analyzeResumeJobMatch", 
        tags: ["Analysis"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resumeText: {
                    type: "string",
                    description: "Full text content of the resume",
                    example: "John Doe\nSoftware Engineer\nExperience with React, Node.js, and AWS...",
                    minLength: 50
                  },
                  jobDescription: {
                    type: "string", 
                    description: "Complete job posting description",
                    example: "We are seeking a Senior Software Engineer with experience in React and Node.js...",
                    minLength: 20
                  }
                },
                required: ["resumeText", "jobDescription"]
              }
            }
          }
        },
        parameters: [
          {
            name: "include",
            in: "query",
            description: "Comma-separated list of analysis components to include (for partial analysis)",
            schema: {
              type: "string",
              example: "atsScore,technicalQuestions"
            }
          }
        ],
        responses: {
          "200": {
            description: "Successful analysis result",
            headers: {
              "X-Cache": {
                description: "Cache status (HIT or MISS)",
                schema: {
                  type: "string",
                  enum: ["HIT", "MISS"]
                }
              }
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    data: {
                      type: "object",
                      properties: {
                        atsScore: {
                          type: "object",
                          properties: {
                            score: {
                              type: "integer",
                              minimum: 0,
                              maximum: 100,
                              example: 75
                            },
                            feedback: {
                              type: "string",
                              example: "Good match with strong technical skills alignment"
                            },
                            strengths: {
                              type: "array",
                              items: {
                                type: "string"
                              },
                              example: ["Strong proficiency in Node.js", "AWS experience matches requirements"]
                            },
                            improvements: {
                              type: "array", 
                              items: {
                                type: "string"
                              },
                              example: ["Add React.js to resume", "Include DevOps experience"]
                            },
                            keywordMatches: {
                              type: "array",
                              items: {
                                type: "string"
                              },
                              example: ["Node.js", "TypeScript", "AWS"]
                            },
                            missingKeywords: {
                              type: "array",
                              items: {
                                type: "string"
                              },
                              example: ["React", "DevOps", "Docker"]
                            }
                          }
                        },
                        technicalQuestions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              question: {
                                type: "string",
                                example: "How would you implement a REST API with Node.js and TypeScript?"
                              },
                              answer: {
                                type: "string",
                                example: "I would start by setting up Express.js with TypeScript..."
                              }
                            }
                          }
                        },
                        behavioralQuestions: {
                          type: "array",
                          items: {
                            type: "object", 
                            properties: {
                              question: {
                                type: "string",
                                example: "Tell me about a time you had to work with a difficult team member"
                              },
                              answer: {
                                type: "string",
                                example: "Using the STAR method, I can describe a situation where..."
                              }
                            }
                          }
                        },
                        presentationTopics: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              topic: {
                                type: "string",
                                example: "Modern JavaScript Development Practices"
                              },
                              keyPoints: {
                                type: "array",
                                items: {
                                  type: "string"
                                },
                                example: ["ES6+ features", "TypeScript benefits", "Testing strategies"]
                              }
                            }
                          }
                        },
                        candidateQuestions: {
                          type: "array",
                          items: {
                            type: "string"
                          },
                          example: ["What does success look like in this role?", "What are the biggest challenges facing the team?"]
                        }
                      }
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2025-09-01T17:47:16.177Z"
                    }
                  },
                  required: ["success", "data", "timestamp"]
                }
              }
            }
          },
          "400": {
            description: "Bad request - invalid input data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse" 
                }
              }
            }
          }
        }
      }
    },
    "/chat": {
      post: {
        summary: "Interactive Interview Coaching",
        description: "Provides real-time interview coaching with AI-powered feedback and follow-up questions",
        operationId: "interviewChat",
        tags: ["Coaching"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description: "User's message or response to interview question", 
                    example: "I have experience with Node.js and have built several REST APIs...",
                    minLength: 1
                  },
                  resumeText: {
                    type: "string",
                    description: "Optional resume context for personalized responses",
                    example: "John Doe - Software Engineer with 5 years experience..."
                  },
                  jobDescription: {
                    type: "string",
                    description: "Optional job description for targeted coaching",
                    example: "Senior Backend Developer position requiring Node.js and AWS..."
                  },
                  type: {
                    type: "string",
                    enum: ["interview", "feedback", "general"],
                    description: "Type of coaching interaction",
                    example: "interview",
                    default: "general"
                  },
                  maxTokens: {
                    type: "integer",
                    minimum: 50,
                    maximum: 4000,
                    description: "Maximum tokens for AI response",
                    example: 1000,
                    default: 1000
                  },
                  conversationHistory: {
                    type: "array",
                    description: "Previous messages in the conversation for context",
                    items: {
                      type: "object",
                      properties: {
                        role: {
                          type: "string",
                          enum: ["user", "assistant"],
                          example: "user"
                        },
                        content: {
                          type: "string",
                          example: "Can you explain your experience with microservices?"
                        }
                      },
                      required: ["role", "content"]
                    }
                  }
                },
                required: ["prompt"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "AI coaching response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true
                    },
                    data: {
                      type: "object", 
                      properties: {
                        response: {
                          type: "string",
                          example: "That's a great start! Your Node.js experience is definitely relevant. Can you tell me about a specific project where you implemented microservices architecture?"
                        },
                        type: {
                          type: "string",
                          example: "interview"
                        },
                        timestamp: {
                          type: "string",
                          format: "date-time",
                          example: "2025-09-01T17:47:16.177Z"
                        }
                      },
                      required: ["response", "type", "timestamp"]
                    }
                  },
                  required: ["success", "data"]
                }
              }
            }
          },
          "400": {
            description: "Bad request - missing or invalid prompt",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Internal Server Error"
          },
          details: {
            type: "string",
            example: "AI analysis failed: 401 Incorrect API key provided"
          },
          errorId: {
            type: "string",
            example: "l7kr8k2oycmf1ewdap"
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2025-09-01T17:47:16.177Z"
          },
          environment: {
            type: "string",
            example: "develop"
          }
        },
        required: ["error", "message", "timestamp"]
      }
    }
  },
  tags: [
    {
      name: "Health",
      description: "API health and information endpoints"
    },
    {
      name: "Analysis", 
      description: "Resume and job description analysis"
    },
    {
      name: "Coaching",
      description: "Interactive interview coaching and feedback"
    }
  ]
} as const;