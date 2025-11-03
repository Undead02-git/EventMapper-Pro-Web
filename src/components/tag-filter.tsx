"use client";

import { type Tag } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

export function TagFilter({ tags, selectedTags, onTagToggle }: TagFilterProps) {
  return (
    <div className="space-y-3">
      {tags.map((tag) => {
        const Icon = tag.iconComponent;
        return (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-muted"
          >
            <Checkbox
              id={tag.id}
              checked={selectedTags.includes(tag.id)}
              onCheckedChange={() => onTagToggle(tag.id)}
              style={{
                backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                borderColor: tag.color,
              }}
            />
            <Label
              htmlFor={tag.id}
              className="flex flex-1 cursor-pointer items-center gap-3 text-sm font-medium"
            >
              {Icon && <Icon className="h-5 w-5" style={{ color: tag.color }} />}
              <span className="flex-grow">{tag.name}</span>
            </Label>
          </motion.div>
        );
      })}
    </div>
  );
}
