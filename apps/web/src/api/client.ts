import axios from "axios";
import type {
  Job,
  JobCreate,
  Resume,
  ResumeCreate,
  Match,
  MatchComputeRequest,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Jobs
export async function getJobs(skip = 0, limit = 20): Promise<Job[]> {
  const { data } = await api.get<Job[]>("/jobs", { params: { skip, limit } });
  return data;
}

export async function getJob(id: string): Promise<Job> {
  const { data } = await api.get<Job>(`/jobs/${id}`);
  return data;
}

export async function createJob(payload: JobCreate): Promise<Job> {
  const { data } = await api.post<Job>("/jobs", payload);
  return data;
}

export async function getJobMatches(
  id: string,
  limit = 10,
): Promise<Match[]> {
  const { data } = await api.get<Match[]>(`/jobs/${id}/matches`, {
    params: { limit },
  });
  return data;
}

// Resumes
export async function getResumes(skip = 0, limit = 20): Promise<Resume[]> {
  const { data } = await api.get<Resume[]>("/resumes", {
    params: { skip, limit },
  });
  return data;
}

export async function getResume(id: string): Promise<Resume> {
  const { data } = await api.get<Resume>(`/resumes/${id}`);
  return data;
}

export async function createResume(payload: ResumeCreate): Promise<Resume> {
  const { data } = await api.post<Resume>("/resumes", payload);
  return data;
}

export async function getResumeMatches(
  id: string,
  limit = 10,
): Promise<Match[]> {
  const { data } = await api.get<Match[]>(`/resumes/${id}/matches`, {
    params: { limit },
  });
  return data;
}

export async function uploadResume(
  candidateName: string,
  file: File,
): Promise<Resume> {
  const formData = new FormData();
  formData.append("candidate_name", candidateName);
  formData.append("file", file);
  const { data } = await api.post<Resume>("/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// Matches
export async function computeMatches(
  payload: MatchComputeRequest,
): Promise<Match[]> {
  const { data } = await api.post<Match[]>("/matches/compute", payload);
  return data;
}

export async function getMatches(
  skip = 0,
  limit = 20,
  filters?: { job_id?: string; resume_id?: string },
): Promise<Match[]> {
  const { data } = await api.get<Match[]>("/matches", {
    params: { skip, limit, ...filters },
  });
  return data;
}
