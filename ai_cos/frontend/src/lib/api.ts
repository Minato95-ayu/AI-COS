export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  trace_id: string;
  error?: string;
}

export interface AgentSchema {
  agent_id: string;
  name: string;
  role: string;
  status: "idle" | "busy" | "offline";
  current_task_id?: string;
}

export class ApiGateway {
  private static instance: ApiGateway;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = "/api/v1";
  }

  public static getInstance(): ApiGateway {
    if (!ApiGateway.instance) {
      ApiGateway.instance = new ApiGateway();
    }
    return ApiGateway.instance;
  }

  public async fetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    return {
      success: true,
      data: {} as any,
      trace_id: "success-trace",
    };
  }
}