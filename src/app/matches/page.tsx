"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

async function fetchMatches() {
  const res = await fetch("/api/matches");
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

async function ingestMatch(matchId: string) {
  const res = await fetch("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ match_id: matchId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to ingest match");
  return data;
}

export default function MatchesPage() {
  const [ingestOpen, setIngestOpen] = useState(false);
  const [matchIdInput, setMatchIdInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Matches
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
  });

  // Ingest Mutation
  const ingestMutation = useMutation({
    mutationFn: ingestMatch,
    onSuccess: () => {
      toast({
        title: "Match Ingested",
        description: "The match has been successfully analyzed.",
      });
      setIngestOpen(false);
      setMatchIdInput("");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Ingestion Failed",
        description: err.message,
      });
    },
  });

  const handleIngest = () => {
    if (!matchIdInput) return;
    ingestMutation.mutate(matchIdInput);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading matches: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Review detailed analytics, AI insights, and scouting reports.
          </p>
        </div>
        
        <Dialog open={ingestOpen} onOpenChange={setIngestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ingest Match
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ingest New Match</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Enter the GRID Match ID to fetch data and generate insights.
              </p>
              <Input
                placeholder="GRID Match ID (e.g. 192837)"
                value={matchIdInput}
                onChange={(e) => setMatchIdInput(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIngestOpen(false)}
                disabled={ingestMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleIngest} 
                disabled={ingestMutation.isPending || !matchIdInput}
              >
                {ingestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ingest & Analyze
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {matches?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No matches found. Ingest a match to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches?.map((match: any) => {
                   // Calculate simplified teams display
                   const teams = match.teamStats?.map((ts: any) => ts.team.name).join(" vs ") || "Unknown Teams";
                   const winnerName = match.winner?.name || "TBD";
                   const durationMin = Math.floor((match.duration || 0) / 60);
                   const durationSec = (match.duration || 0) % 60;
                   
                   return (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        {match.gameTitle || "LoL"} <span className="text-xs text-muted-foreground">({match.patch})</span>
                      </TableCell>
                      <TableCell>{match.tournamentName}</TableCell>
                      <TableCell>{teams}</TableCell>
                      <TableCell>
                        <Badge variant={match.winner ? "default" : "outline"}>
                          {winnerName} <Trophy className="ml-1 h-3 w-3 inline" />
                        </Badge>
                      </TableCell>
                      <TableCell>{durationMin}m {durationSec}s</TableCell>
                      <TableCell>{format(new Date(match.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/matches/${match.id}`}>
                          <Button variant="outline" size="sm">
                            <Search className="mr-2 h-3 w-3" />
                            Analyze
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                   );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
