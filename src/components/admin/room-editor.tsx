"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, ChevronsUpDown } from "lucide-react";
import { type Floor, type Room, type Tag } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { generateRoomPathAndLabel } from "@/lib/geometry";

// More robust ID generation for rooms
const generateRoomId = (floorId: number, rooms: Room[]) => {
  const existingIds = rooms.map(r => parseInt(r.id.split('-')[1], 10)).filter(id => !isNaN(id));
  const maxId = Math.max(0, ...existingIds);
  // The user's floor IDs start at 1, but the initial data had rooms like '101'. Let's stick to a simpler scheme.
  const floorPrefix = floorId;
  const newNumericId = maxId >= 100 ? maxId + 1 : (floorPrefix * 100) + Math.max(0, ...rooms.map(r => parseInt(r.id, 10) % 100)) + 1;
  return `${newNumericId}`;
};

const roomSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
  floor: z.number(),
  wing: z.number().min(1).max(4),
  position: z.enum(['inner', 'outer']),
  order: z.number().min(0),
  path: z.string(),
  labelCoordinates: z.object({
      x: z.number(),
      y: z.number(),
  }),
  tagIds: z.array(z.string()),
  status: z.enum(['Available', 'In Use', 'Maintenance']),
  statusRemark: z.string().optional(),
});

const formSchema = z.object({
  rooms: z.array(roomSchema),
});

interface RoomEditorProps {
  floors: Floor[];
  onFloorsUpdate: (floors: Floor[]) => void;
  currentFloorId: number;
  tags: Tag[];
}

export function RoomEditor({ floors, onFloorsUpdate, currentFloorId, tags }: RoomEditorProps) {
  const { toast } = useToast();
  const currentFloor = floors.find(f => f.id === currentFloorId)!;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rooms: currentFloor.rooms,
    },
    // This is important to re-initialize the form when the floor changes
    key: currentFloorId,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "rooms",
  });
    
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Regenerate paths before saving
    const roomsWithPath = data.rooms.map(room => {
      const { path, labelCoordinates } = generateRoomPathAndLabel(room.wing, room.position, room.order);
      return { ...room, path, labelCoordinates };
    });

    const updatedFloors = floors.map(floor =>
      floor.id === currentFloorId
        ? { ...floor, rooms: roomsWithPath }
        : floor
    );
    onFloorsUpdate(updatedFloors);
    toast({
      title: "Rooms Updated",
      description: `Changes to rooms on ${currentFloor.name} have been saved.`,
    });
  };

  const handleAddNewRoom = (position: 'inner' | 'outer') => {
    const newId = generateRoomId(currentFloorId, form.getValues().rooms);
    const roomsInPosition = form.getValues().rooms.filter(r => r.position === position);
    const order = roomsInPosition.length;
    
    const { path, labelCoordinates } = generateRoomPathAndLabel(1, position, order);

    append({
        id: newId,
        floor: currentFloorId,
        wing: 1,
        position,
        order,
        path,
        labelCoordinates,
        tagIds: [],
        status: 'Available',
        statusRemark: '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="font-headline text-lg font-medium">Manage Rooms ({currentFloor.name})</h3>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {fields.map((field, index) => (
                <Collapsible key={field.id} className="p-4 border rounded-lg space-y-4">
                 <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="font-semibold">Room {form.watch(`rooms.${index}.id`)}</span>
                            <span className="text-sm text-muted-foreground"> (Wing {form.watch(`rooms.${index}.wing`)})</span>
                        </div>
                    </CollapsibleTrigger>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                 </div>
                <CollapsibleContent className="space-y-4 pt-4 border-t">
                    <FormField
                    control={form.control}
                    name={`rooms.${index}.id`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Room ID</FormLabel>
                        <FormControl>
                            <Input placeholder="101" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`rooms.${index}.wing`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wing</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select wing" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1 (North)</SelectItem>
                                            <SelectItem value="2">2 (East)</SelectItem>
                                            <SelectItem value="3">3 (South)</SelectItem>
                                            <SelectItem value="4">4 (West)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`rooms.${index}.position`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="outer">Outer Circle</SelectItem>
                                            <SelectItem value="inner">Inner Circle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name={`rooms.${index}.order`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`rooms.${index}.status`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Available">Available</SelectItem>
                                            <SelectItem value="In Use">In Use</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name={`rooms.${index}.statusRemark`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Status Remark</FormLabel>
                            <FormControl>
                                <Input placeholder="E.g., Keynote session" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`rooms.${index}.tagIds`}
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                <FormLabel className="text-base">Tags</FormLabel>
                                </div>
                                <div className="space-y-2">
                                {tags.map((tag) => (
                                    <FormField
                                    key={tag.id}
                                    control={form.control}
                                    name={`rooms.${index}.tagIds`}
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={tag.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(tag.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), tag.id])
                                                    : field.onChange(
                                                        (field.value || []).filter(
                                                        (value) => value !== tag.id
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {tag.name}
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between mt-6">
           <div className="flex gap-2">
             <Button
               type="button"
               variant="outline"
               onClick={() => handleAddNewRoom('outer')}
             >
              <Plus className="mr-2 h-4 w-4" /> Add Outer Room
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={() => handleAddNewRoom('inner')}
             >
              <Plus className="mr-2 h-4 w-4" /> Add Inner Room
             </Button>
           </div>
           <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
