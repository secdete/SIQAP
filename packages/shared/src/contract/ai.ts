import { z } from "zod";
import { QuestionInput } from "./schemas.js";

export const GenerateQuizInput = z.object({
  topic: z.string().max(200).optional(),
  text: z.string().max(15000).optional(),          // teks hasil ekstrak PDF dikirim sebagai text
  count: z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  language: z.enum(["id", "en"]).default("id"),
}).refine((v) => Boolean(v.topic || v.text), { message: "topic atau text wajib diisi" });

export type GenerateQuizInput = z.infer<typeof GenerateQuizInput>;

export const GenerateQuizOutput = z.object({
  questions: z.array(QuestionInput.omit({ id: true })).min(1).max(50),
});

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutput>;

export interface QuizGenerator {
  generate(input: GenerateQuizInput): Promise<GenerateQuizOutput>;
}
