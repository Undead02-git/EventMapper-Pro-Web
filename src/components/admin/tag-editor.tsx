"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash, Plus } from "lucide-react";
import { type Tag } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon name is required"), // Now icon name, not initials
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  remark: z.string().optional(),
});

const formSchema = z.object({
  tags: z.array(tagSchema),
});

interface TagEditorProps {
  currentTags: Tag[];
  onTagsUpdate: (tags: Omit<Tag, 'iconComponent'>[]) => void;
}

export function TagEditor({ currentTags, onTagsUpdate }: TagEditorProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: currentTags.map(t => ({...t, icon: t.icon || 'Star', remark: t.remark || ''}))
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onTagsUpdate(data.tags);
    toast({
      title: "Tags Updated",
      description: "Your changes to the tags have been saved.",
    });
  }
  
  const handleAddTag = () => {
    // Generate a more stable unique ID on the client
    const newId = `new-tag-${Math.random().toString(36).substr(2, 9)}`;
    append({ id: newId, name: "", icon: "Star", color: "#7986CB", remark: "" });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="font-headline text-lg font-medium">Manage Tags</h3>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                <FormField
                  control={form.control}
                  name={`tags.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Conference Hall" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`tags.${index}.icon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Building" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tags.${index}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input type="color" className="p-1 h-10 w-full" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name={`tags.${index}.remark`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remark</FormLabel>
                      <FormControl>
                        <Input placeholder="Description for this tag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between">
           <Button
             type="button"
             variant="outline"
             onClick={handleAddTag}
           >
            <Plus className="mr-2 h-4 w-4" /> Add Tag
           </Button>
           <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
