"use client";

import { useState } from "react";
import { Plus, Trash2, Save, HelpCircle, Check, Settings, Sparkles } from "lucide-react";
import { Lesson, Quiz, QuizQuestion, QuizQuestionType } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createDefaultQuiz, createDefaultQuestion, generateId } from "@/lib/admin-mock-data";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface QuizBuilderTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function QuizBuilderTab({ lesson, onSaveMock }: QuizBuilderTabProps) {
  const [quiz, setQuiz] = useState<Quiz>(lesson.quiz || createDefaultQuiz(lesson.id));
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const handleAddQuestion = () => {
    const newQ = createDefaultQuestion(quiz.id, quiz.questions.length);
    setQuiz({ ...quiz, questions: [...quiz.questions, newQ] });
    setSaveState("unsaved");
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuiz({ ...quiz, questions: quiz.questions.filter((q) => q.id !== qId) });
    setSaveState("unsaved");
  };

  const handleAddOption = (qId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) => {
        if (q.id === qId) {
          const newOpt = {
            id: generateId("opt"),
            questionId: qId,
            text: `Đáp án ${q.options.length + 1}`,
            isCorrect: false,
            orderIndex: q.options.length,
          };
          return { ...q, options: [...q.options, newOpt] };
        }
        return q;
      }),
    });
    setSaveState("unsaved");
  };

  const handleSetCorrectOption = (qId: string, optId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((opt) => ({
              ...opt,
              isCorrect: opt.id === optId,
            })),
          };
        }
        return q;
      }),
    });
    setSaveState("unsaved");
  };

  const handleSaveAll = () => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({ quiz });
      setSaveState("saved");
    }, 600);
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" /> 6. Trình Tạo Bài Kiểm Tra (Quiz Builder)
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      {/* General Settings for Quiz */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Điểm đạt để qua bài (%)</label>
          <Input
            type="number"
            value={quiz.passingScore}
            onChange={(e) => {
              setQuiz({ ...quiz, passingScore: Number(e.target.value) });
              setSaveState("unsaved");
            }}
            className="text-xs"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Số lần làm lại (0 = Vĩnh viễn)</label>
          <Input
            type="number"
            value={quiz.maxAttempts}
            onChange={(e) => {
              setQuiz({ ...quiz, maxAttempts: Number(e.target.value) });
              setSaveState("unsaved");
            }}
            className="text-xs"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Thời gian làm bài (Phút)</label>
          <Input
            type="number"
            value={quiz.timeLimitMinutes}
            onChange={(e) => {
              setQuiz({ ...quiz, timeLimitMinutes: Number(e.target.value) });
              setSaveState("unsaved");
            }}
            className="text-xs"
          />
        </div>

        <div className="md:col-span-3 flex flex-wrap gap-4 pt-2 border-t border-zinc-800 text-zinc-300">
          <label className="flex items-center gap-2">
            <Switch
              checked={quiz.shuffleQuestions}
              onCheckedChange={(val) => {
                setQuiz({ ...quiz, shuffleQuestions: val });
                setSaveState("unsaved");
              }}
            />
            <span>Trộn thứ tự câu hỏi</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch
              checked={quiz.requirePassToUnlockNext}
              onCheckedChange={(val) => {
                setQuiz({ ...quiz, requirePassToUnlockNext: val });
                setSaveState("unsaved");
              }}
            />
            <span>Bắt buộc đạt Quiz mới được mở bài học tiếp theo</span>
          </label>
        </div>
      </div>

      {/* Questions Builder */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Danh Sách Câu Hỏi ({quiz.questions.length})
          </h4>
          <Button variant="gold" size="sm" onClick={handleAddQuestion} className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Câu Hỏi
          </Button>
        </div>

        {quiz.questions.map((q, qIndex) => (
          <div key={q.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-gold-400">Câu hỏi #{qIndex + 1}</span>
              <div className="flex items-center gap-2">
                <Select
                  value={q.type}
                  onValueChange={(val) => {
                    setQuiz({
                      ...quiz,
                      questions: quiz.questions.map((item) =>
                        item.id === q.id ? { ...item, type: val as QuizQuestionType } : item
                      ),
                    });
                    setSaveState("unsaved");
                  }}
                >
                  <SelectTrigger className="w-[160px] h-8 bg-zinc-900 border-zinc-800 text-xs">
                    <SelectValue placeholder="Loại câu hỏi" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
                    <SelectItem value="single_choice">Một đáp án (Single Choice)</SelectItem>
                    <SelectItem value="multiple_choice">Nhiều đáp án (Multiple Choice)</SelectItem>
                    <SelectItem value="true_false">Đúng / Sai (True/False)</SelectItem>
                    <SelectItem value="short_answer">Tự luận ngắn</SelectItem>
                    <SelectItem value="essay">Bài luận tự luận</SelectItem>
                  </SelectContent>
                </Select>

                <button onClick={() => handleRemoveQuestion(q.id)} className="p-1 text-zinc-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Input
              value={q.text}
              onChange={(e) => {
                setQuiz({
                  ...quiz,
                  questions: quiz.questions.map((item) =>
                    item.id === q.id ? { ...item, text: e.target.value } : item
                  ),
                });
                setSaveState("unsaved");
              }}
              placeholder="Nhập nội dung câu hỏi..."
              className="text-xs"
            />

            {/* Options list for choice types */}
            {(q.type === "single_choice" || q.type === "multiple_choice" || q.type === "true_false") && (
              <div className="space-y-2 pl-2 border-l-2 border-zinc-800">
                <label className="text-[11px] font-semibold text-zinc-400 block">Các đáp án lựa chọn:</label>
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetCorrectOption(q.id, opt.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        opt.isCorrect ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold" : "border-zinc-700 text-transparent"
                      }`}
                      title="Đánh dấu đáp án đúng"
                    >
                      ✓
                    </button>
                    <Input
                      value={opt.text}
                      onChange={(e) => {
                        setQuiz({
                          ...quiz,
                          questions: quiz.questions.map((item) => {
                            if (item.id === q.id) {
                              return {
                                ...item,
                                options: item.options.map((o) =>
                                  o.id === opt.id ? { ...o, text: e.target.value } : o
                                ),
                              };
                            }
                            return item;
                          }),
                        });
                        setSaveState("unsaved");
                      }}
                      className="text-xs h-8"
                    />
                  </div>
                ))}

                {q.type !== "true_false" && (
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddOption(q.id)} className="text-[11px] h-7">
                    + Thêm đáp án chọn
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Quiz
        </Button>
      </div>
    </div>
  );
}
