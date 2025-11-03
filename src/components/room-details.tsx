import { type Room, type Tag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface RoomDetailsProps {
  room: Room;
  tags: Tag[];
}

const statusColors = {
  Available: "bg-green-500",
  "In Use": "bg-red-500",
  Maintenance: "bg-yellow-500",
};

export function RoomDetails({ room, tags }: RoomDetailsProps) {
  const roomTags = tags.filter((tag) => room.tagIds.includes(tag.id));

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-semibold">
          Room <span className="font-code">{room.id}</span>
        </h3>
        <div className="flex items-center gap-2">
           <span className={`h-2 w-2 rounded-full ${statusColors[room.status]}`} />
           <span className="text-sm text-muted-foreground">{room.status}</span>
        </div>
      </div>
      
      {room.statusRemark && <p className="text-sm text-muted-foreground -mt-2">{room.statusRemark}</p>}

      <Separator />
      
      {roomTags.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Assigned Tags</h4>
          <div className="space-y-3">
          {roomTags.map((tag) => {
            const Icon = tag.iconComponent || Star;
            return (
              <div key={tag.id} className="flex gap-3">
                <Icon className="h-5 w-5 mt-0.5" style={{color: tag.color}} />
                <div>
                  <p className="font-semibold text-sm">{tag.name}</p>
                  <p className="text-sm text-muted-foreground">{tag.remark}</p>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No tags assigned to this room.</p>
      )}
    </div>
  );
}
