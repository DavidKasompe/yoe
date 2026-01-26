"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Trophy, 
  Timer, 
  Swords, 
  BrainCircuit, 
  Users,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

async function fetchMatchDetail(id: string) {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch match");
  }
  return res.json();
}

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const { data: match, isLoading, error } = useQuery({
    queryKey: ["match", params.id],
    queryFn: () => fetchMatchDetail(params.id),
  });

  if (isLoading) return <div className="p-10 text-center">Loading match data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;
  if (!match) return <div className="p-10 text-center text-muted-foreground">Match not found.</div>;

  // Derived Stats
  const durationMin = Math.floor((match.duration || 0) / 60);
  const durationSec = (match.duration || 0) % 60;

  const blueTeamStats = match.teamStats[0];
  const redTeamStats = match.teamStats[1];
  const blueTeam = blueTeamStats?.team;
  const redTeam = redTeamStats?.team;

  // Calculate Total Kills per Team
  const blueKills = match.playerStats
    .filter((ps: any) => ps.player.teamId === blueTeam?.id)
    .reduce((acc: number, ps: any) => acc + ps.kills, 0);
    
  const redKills = match.playerStats
    .filter((ps: any) => ps.player.teamId === redTeam?.id)
    .reduce((acc: number, ps: any) => acc + ps.kills, 0);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/matches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{match.gameTitle || "Match Analysis"}</h1>
            <Badge variant="outline">{match.patch}</Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-medium">{match.tournamentName}</span>
            <span>•</span>
            <span>{format(new Date(match.date), "PPP p")}</span>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="text-right">
             <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Duration</div>
             <div className="font-mono text-xl flex items-center justify-end gap-2">
                <Timer className="h-4 w-4" />
                {durationMin}:{durationSec.toString().padStart(2, '0')}
             </div>
          </div>
           <div className="text-right">
             <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Winner</div>
             <div className="text-xl font-bold text-primary flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {match.winner?.name || "TBD"}
             </div>
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <Card className="bg-muted/50">
        <CardContent className="p-8">
          <div className="grid grid-cols-3 items-center">
            {/* Blue Team */}
            <div className="text-right space-y-2">
               <h2 className="text-3xl font-bold">{blueTeam?.name || "Blue Team"}</h2>
               <div className="text-5xl font-mono font-black text-blue-500">{blueKills}</div>
               <div className="flex justify-end gap-3 text-sm text-muted-foreground">
                  <span>🐉 {blueTeamStats?.dragons || 0}</span>
                  <span>🗼 {blueTeamStats?.towers || 0}</span>
                  <span>👾 {blueTeamStats?.barons || 0}</span>
               </div>
            </div>

            {/* VS */}
            <div className="text-center">
               <div className="text-xl font-black text-muted-foreground">VS</div>
               <div className="text-xs mt-1 text-muted-foreground">Bo{match.formatType === 'bestOf1' ? '1' : match.formatType === 'bestOf3' ? '3' : 'X'}</div>
            </div>

            {/* Red Team */}
            <div className="text-left space-y-2">
               <h2 className="text-3xl font-bold">{redTeam?.name || "Red Team"}</h2>
               <div className="text-5xl font-mono font-black text-red-500">{redKills}</div>
               <div className="flex justify-start gap-3 text-sm text-muted-foreground">
                  <span>🐉 {redTeamStats?.dragons || 0}</span>
                  <span>🗼 {redTeamStats?.towers || 0}</span>
                  <span>👾 {redTeamStats?.barons || 0}</span>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="stats">Player Stats</TabsTrigger>
          <TabsTrigger value="analysis">AI Insights</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
           {/* Blue Team Table */}
           <Card>
             <CardHeader>
               <CardTitle className="text-blue-500">{blueTeam?.name} Stats</CardTitle>
             </CardHeader>
             <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">K / D / A</TableHead>
                      <TableHead className="text-right">CS</TableHead>
                      <TableHead className="text-right">Gold</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {match.playerStats
                      .filter((ps: any) => ps.player.teamId === blueTeam?.id)
                      .map((ps: any) => (
                      <TableRow key={ps.id}>
                        <TableCell className="font-medium text-muted-foreground">{ps.player.role || "Unknown"}</TableCell>
                        <TableCell className="font-bold">{ps.player.identifier}</TableCell>
                        <TableCell className="text-right font-mono">{ps.kills} / {ps.deaths} / {ps.assists}</TableCell>
                        <TableCell className="text-right">{ps.cs}</TableCell>
                        <TableCell className="text-right text-yellow-600 font-medium">{(ps.goldEarned / 1000).toFixed(1)}k</TableCell>
                        <TableCell className="text-right">
                           <Badge variant="secondary">{(ps.positioningScore * 10).toFixed(1)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
           </Card>

           {/* Red Team Table */}
           <Card>
             <CardHeader>
               <CardTitle className="text-red-500">{redTeam?.name} Stats</CardTitle>
             </CardHeader>
             <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead>Role</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">K / D / A</TableHead>
                      <TableHead className="text-right">CS</TableHead>
                      <TableHead className="text-right">Gold</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {match.playerStats
                      .filter((ps: any) => ps.player.teamId === redTeam?.id)
                      .map((ps: any) => (
                      <TableRow key={ps.id}>
                        <TableCell className="font-medium text-muted-foreground">{ps.player.role || "Unknown"}</TableCell>
                        <TableCell className="font-bold">{ps.player.identifier}</TableCell>
                        <TableCell className="text-right font-mono">{ps.kills} / {ps.deaths} / {ps.assists}</TableCell>
                        <TableCell className="text-right">{ps.cs}</TableCell>
                        <TableCell className="text-right text-yellow-600 font-medium">{(ps.goldEarned / 1000).toFixed(1)}k</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{(ps.positioningScore * 10).toFixed(1)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
           </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
           {!match.insights || match.insights.length === 0 ? (
             <Card>
               <CardContent className="py-10 text-center text-muted-foreground">
                 No AI insights generated for this match yet.
               </CardContent>
             </Card>
           ) : (
             <div className="grid gap-4 md:grid-cols-2">
                {match.insights.map((insight: any) => (
                  <Card key={insight.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">
                          {insight.category}
                       </CardTitle>
                       <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                       <div className="text-md font-medium mt-2 leading-relaxed">
                          {insight.explanation}
                       </div>
                       <p className="text-xs text-muted-foreground mt-4">
                          Confidence: {(insight.confidence * 100).toFixed(0)}%
                       </p>
                    </CardContent>
                  </Card>
                ))}
             </div>
           )}
        </TabsContent>
        
        {/* Draft Tab */}
        <TabsContent value="draft" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {match.drafts?.map((draft: any) => {
              const bans = JSON.parse(draft.bans || "[]");
              const picks = JSON.parse(draft.picks || "[]");
              const isBlue = draft.teamId === blueTeam?.id;
              
              return (
                <Card key={draft.id} className={isBlue ? "border-blue-200" : "border-red-200"}>
                   <CardHeader>
                      <CardTitle className={isBlue ? "text-blue-600" : "text-red-600"}>
                         {draft.team.name} Draft
                      </CardTitle>
                      <CardDescription>
                         Win Probability: {(draft.winProbability * 100).toFixed(1)}%
                      </CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      <div>
                         <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">Bans</h4>
                         <div className="flex flex-wrap gap-2">
                            {bans.map((ban: string, i: number) => (
                               <Badge key={i} variant="outline" className="text-muted-foreground border-destructive/50">
                                  🚫 {ban}
                               </Badge>
                            ))}
                         </div>
                      </div>
                      <div>
                         <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">Picks</h4>
                         <div className="space-y-2">
                            {picks.map((pick: string, i: number) => (
                               <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                                  <span className="font-medium">{pick}</span>
                                  <span className="text-xs text-muted-foreground">Pick {i + 1}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="overview">
           <Card>
             <CardHeader>
               <CardTitle>Match Overview</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">Additional summary charts and gold graphs would go here.</p>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
