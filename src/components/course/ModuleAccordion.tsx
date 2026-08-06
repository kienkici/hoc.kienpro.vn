import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MockModule } from "@/lib/mock-data";
import { LessonItem } from "@/components/lesson/LessonItem";

interface ModuleAccordionProps {
  modules: MockModule[];
  courseSlug: string;
  currentLessonSlug?: string;
  completedLessonIds?: string[];
}

export function ModuleAccordion({
  modules,
  courseSlug,
  currentLessonSlug,
  completedLessonIds = [],
}: ModuleAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={modules.map((m) => m.id)}
      className="w-full space-y-3"
    >
      {modules.map((module) => (
        <AccordionItem
          key={module.id}
          value={module.id}
          className="border border-zinc-800 rounded-lg bg-zinc-900/40 px-4 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm text-zinc-100">
                {module.title}
              </span>
              <span className="text-xs text-zinc-400 font-normal mt-0.5">
                {module.lessons.length} bài học
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3 space-y-1.5">
            {module.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                courseSlug={courseSlug}
                isCurrent={lesson.slug === currentLessonSlug}
                isCompleted={completedLessonIds.includes(lesson.id)}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
