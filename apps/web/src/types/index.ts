export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[] | null;
  created_at: string;
}

export interface Resume {
  id: string;
  candidate_name: string;
  content: string;
  skills: string[] | null;
  file_name: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  job_id: string;
  resume_id: string;
  similarity_score: number;
  bias_reduced: boolean;
  created_at: string;
  job_title: string | null;
  job_company: string | null;
  candidate_name: string | null;
}

export interface JobCreate {
  title: string;
  company: string;
  description: string;
}

export interface ResumeCreate {
  candidate_name: string;
  content: string;
}

export interface MatchComputeRequest {
  job_id?: string;
  resume_id?: string;
  bias_reduced?: boolean;
}
