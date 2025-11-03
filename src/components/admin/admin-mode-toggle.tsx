"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminModeToggleProps {
  isAdminMode: boolean;
  onAdminModeChange: (isAdmin: boolean) => void;
}

const ADMIN_PASSWORD = "pro";

export function AdminModeToggle({
  isAdminMode,
  onAdminModeChange,
}: AdminModeToggleProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleToggle = () => {
    if (isAdminMode) {
      onAdminModeChange(false);
      toast({
        title: "Admin Mode Deactivated",
        description: "You no longer have access to administrative tools.",
      });
    } else {
      setDialogOpen(true);
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onAdminModeChange(true);
      setDialogOpen(false);
      setPassword("");
      toast({
        title: "Admin Mode Activated",
        description: "You now have access to administrative tools.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "The password you entered is incorrect.",
      });
    }
  };

  return (
    <>
      <Button
        variant={isAdminMode ? "destructive" : "outline"}
        size="icon"
        onClick={handleToggle}
        aria-label={isAdminMode ? "Deactivate Admin Mode" : "Activate Admin Mode"}
      >
        {isAdminMode ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Administrator Login</DialogTitle>
            <DialogDescription>
              Please enter the password to access editing tools.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" the="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleLogin}>
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
