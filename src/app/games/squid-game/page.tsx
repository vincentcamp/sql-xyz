"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { ChevronRight, Award, Users, Skull, RefreshCw, Code, ArrowLeft } from "lucide-react";

// Game data
const games = [
  {
    id: 1,
    name: "Red Light, Green Light",
    description: "Write basic SELECT queries before the doll turns around!",
    instruction: "Find all players with debt over 100 million won before time runs out!",
    sqlConcepts: ["SELECT statements", "WHERE clauses", "Filtering data"],
    challenge: "SELECT player_id, name, debt FROM players WHERE debt > 100000000;",
    template: "SELECT _______ FROM players WHERE _______ > 100000000;",
    solution: ["player_id, name, debt", "debt"],
    timeLimit: 60,
    eliminationPenalty: "Restart the level",
    backgroundImage: "url('/redlight-background.jpg')",
    characterImage: "url('/doll.png')",
  },
  {
    id: 2,
    name: "Sugar Honeycomb",
    description: "Carefully 'cut out' data patterns with precise JOIN statements.",
    instruction: "Extract player information along with their game performance without breaking relationships!",
    sqlConcepts: ["INNER JOIN", "LEFT JOIN", "Multiple table relationships"],
    challenge: "SELECT p.player_id, p.name, g.score, g.game_id FROM players p INNER JOIN game_results g ON p.player_id = g.player_id;",
    template: "SELECT p.player_id, p.name, _______ \nFROM players p\n_______ game_results g ON _______ = _______;",
    solution: ["g.score, g.game_id", "INNER JOIN", "p.player_id", "g.player_id"],
    timeLimit: 90,
    eliminationPenalty: "Restart and lose progress",
    backgroundImage: "url('/honeycomb-background.jpg')",
    characterImage: "url('/guard.png')",
  },
  {
    id: 3,
    name: "Tug of War",
    description: "Pull insights from datasets using aggregation functions to beat your opponents.",
    instruction: "Analyze total debt by age group to pull your team to victory!",
    sqlConcepts: ["GROUP BY", "SUM", "AVG", "Aggregation functions"],
    challenge: "SELECT age_group, SUM(debt) as total_debt FROM players GROUP BY age_group HAVING SUM(debt) > 1000000000;",
    template: "SELECT age_group, _______(debt) as total_debt\nFROM players\n_______ BY _______\nHAVING _______ > 1000000000;",
    solution: ["SUM", "GROUP", "age_group", "SUM(debt)"],
    timeLimit: 120,
    eliminationPenalty: "Lose team members",
    backgroundImage: "url('/tugofwar-background.jpg')",
    characterImage: "url('/team.png')",
  },
  {
    id: 4,
    name: "Marbles",
    description: "Outperform your partner with superior subqueries and CTEs.",
    instruction: "Find players who performed better than the average in their assigned teams!",
    sqlConcepts: ["Subqueries", "Common Table Expressions (CTEs)", "Temporary tables"],
    challenge: "SELECT player_id, score FROM game_results WHERE score > (SELECT AVG(score) FROM game_results WHERE team_id = game_results.team_id);",
    template: "SELECT player_id, score\nFROM game_results\nWHERE score > (\n    _______ \n    _______ \n    _______\n);",
    solution: ["SELECT AVG(score)", "FROM game_results", "WHERE team_id = game_results.team_id"],
    timeLimit: 150,
    eliminationPenalty: "Lose your partner",
    backgroundImage: "url('/marbles-background.jpg')",
    characterImage: "url('/old-man.png')",
  },
  {
    id: 5,
    name: "Glass Bridge",
    description: "Cross a treacherous bridge by choosing correct SQL window functions.",
    instruction: "Rank players within each game by their performance to find the safe path forward!",
    sqlConcepts: ["Window functions", "PARTITION BY", "Ranking functions"],
    challenge: "SELECT player_id, game_id, score, RANK() OVER (PARTITION BY game_id ORDER BY score DESC) as rank FROM game_results;",
    template: "SELECT player_id, game_id, score,\n    _______ OVER (PARTITION BY _______ ORDER BY _______ DESC) as rank\nFROM game_results;",
    solution: ["RANK()", "game_id", "score"],
    timeLimit: 180,
    eliminationPenalty: "Fall and restart",
    backgroundImage: "url('/bridge-background.jpg')",
    characterImage: "url('/bridge-player.png')",
  },
  {
    id: 6,
    name: "Final Squid Game",
    description: "Master all SQL skills in a comprehensive challenge against the Front Man.",
    instruction: "Analyze the entire game history to identify patterns and present a comprehensive report!",
    sqlConcepts: ["Complex joins", "Subqueries", "Window functions", "Data manipulation"],
    challenge: `WITH player_performance AS (
  SELECT 
    p.player_id, 
    p.name, 
    COUNT(gr.game_id) as games_played,
    AVG(gr.score) as avg_score
  FROM players p
  JOIN game_results gr ON p.player_id = gr.player_id
  GROUP BY p.player_id, p.name
),
game_difficulty AS (
  SELECT 
    g.game_id,
    g.name as game_name,
    AVG(gr.score) as avg_game_score,
    COUNT(DISTINCT gr.player_id) as participants
  FROM games g
  JOIN game_results gr ON g.game_id = gr.game_id
  GROUP BY g.game_id, g.name
)
SELECT 
  pp.player_id,
  pp.name,
  pp.games_played,
  pp.avg_score,
  gd.game_name,
  gd.avg_game_score
FROM player_performance pp
JOIN game_results gr ON pp.player_id = gr.player_id
JOIN game_difficulty gd ON gr.game_id = gd.game_id
WHERE pp.avg_score > gd.avg_game_score
GROUP BY pp.player_id, pp.name, pp.games_played, pp.avg_score, gd.game_name, gd.avg_game_score
ORDER BY pp.avg_score DESC;`,
    template: `WITH player_performance AS (
    _______
),
game_difficulty AS (
    _______
)
SELECT _______
FROM player_performance pp
JOIN game_results gr ON _______
JOIN game_difficulty gd ON _______
WHERE _______
GROUP BY _______
ORDER BY _______;`,
    solution: [
      `SELECT 
    p.player_id, 
    p.name, 
    COUNT(gr.game_id) as games_played,
    AVG(gr.score) as avg_score
  FROM players p
  JOIN game_results gr ON p.player_id = gr.player_id
  GROUP BY p.player_id, p.name`,
      `SELECT 
    g.game_id,
    g.name as game_name,
    AVG(gr.score) as avg_game_score,
    COUNT(DISTINCT gr.player_id) as participants
  FROM games g
  JOIN game_results gr ON g.game_id = gr.game_id
  GROUP BY g.game_id, g.name`,
      `pp.player_id,
  pp.name,
  pp.games_played,
  pp.avg_score,
  gd.game_name,
  gd.avg_game_score`,
      `pp.player_id = gr.player_id`,
      `gr.game_id = gd.game_id`,
      `pp.avg_score > gd.avg_game_score`,
      `pp.player_id, pp.name, pp.games_played, pp.avg_score, gd.game_name, gd.avg_game_score`,
      `pp.avg_score DESC`
    ],
    timeLimit: 300,
    eliminationPenalty: "Game Over",
    backgroundImage: "url('/final-game-background.jpg')",
    characterImage: "url('/front-man.png')",
  }
];

export default function SQLSquidGamePage() {
  // We're importing router but not using it - let's comment it out for now
  // const router = useRouter();
  const { toast } = useToast();
  const sqlEditorRef = useRef(null);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentGame, setCurrentGame] = useState(games[0]);
  const [userQuery, setUserQuery] = useState("");
  const [gameStatus, setGameStatus] = useState("idle"); // idle, playing, success, failed
  const [showSolution, setShowSolution] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [prizePool, setPrizePool] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerStats, setPlayerStats] = useState({
    gamesCompleted: 0,
    totalTime: 0,
    deaths: 0,
  });
  const [leaderboard, setLeaderboard] = useState([
    { name: "Player001", completed: 6, prize: 45600000000, time: 987 },
    { name: "SQLMaster", completed: 6, prize: 42300000000, time: 1045 },
    { name: "QueryKing", completed: 5, prize: 35800000000, time: 890 },
    { name: "DataNinja", completed: 4, prize: 28700000000, time: 780 },
    { name: "JoinMaster", completed: 3, prize: 18500000000, time: 632 },
  ]);

  // Handle failure function - defined before useEffect to fix dependency warning
  interface PlayerStats {
    gamesCompleted: number;
    totalTime: number;
    deaths: number;
  }

  const handleFailure = (reason: string) => {
    setGameStatus("failed");
    setTimerActive(false);
    setLives((prev) => prev - 1);
    setPlayerStats((prev: PlayerStats) => ({
      ...prev,
      deaths: prev.deaths + 1,
    }));

    toast({
      title: "Eliminated!",
      description: reason + ` You have ${lives - 1} lives remaining.`,
      variant: "destructive",
    });
  };
  
  // Countdown logic
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    
    if (timerActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      handleFailure("Time ran out!");
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [timerActive, timeLeft, handleFailure]);  
  
  // Set current game when level changes
  useEffect(() => {
    if (currentLevel > 0 && currentLevel <= games.length) {
      setCurrentGame(games[currentLevel - 1]);
      setTimeLeft(games[currentLevel - 1].timeLimit);
      setUserQuery("");
      setShowSolution(false);
    }
  }, [currentLevel]);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setCurrentLevel(1);
    setGameStatus("playing");
    setTimerActive(true);
    setPrizePool(0);
    setLives(3);
    setPlayerStats({
      gamesCompleted: 0,
      totalTime: 0,
      deaths: 0,
    });
  };
  
  // Check SQL solution
  const checkSolution = () => {
    const currentSolution = currentGame.solution;
    let correct = true;
    const userQueryCleaned = userQuery.trim().replace(/\s+/g, ' ');
    
    // Simple validation - check if all solution parts are in the user query
    for (const part of currentSolution) {
      if (!userQueryCleaned.includes(part)) {
        correct = false;
        break;
      }
    }
    
    if (correct) {
      handleSuccess();
    } else {
      handleFailure("Incorrect SQL query!");
    }
  };
  
  // Handle successful completion
  const handleSuccess = () => {
    setGameStatus("success");
    setTimerActive(false);
    setPrizePool(prevPrize => prevPrize + 100000000);
    setPlayerStats(prev => ({
      ...prev,
      gamesCompleted: prev.gamesCompleted + 1,
      totalTime: prev.totalTime + (currentGame.timeLimit - timeLeft),
    }));
    
    toast({
      title: "Challenge Complete!",
      description: `You've earned ₩100 million! Your prize pool: ₩${(prizePool + 100000000).toLocaleString()}`,
      variant: "success",
    });
  };
  
  // Move to next level
  const nextLevel = () => {
    if (currentLevel < games.length) {
      setCurrentLevel(prev => prev + 1);
      setGameStatus("playing");
      setTimerActive(true);
    } else {
      // Game completed
      toast({
        title: "Congratulations!",
        description: `You've completed SQL Squid Game and won ₩${prizePool.toLocaleString()}!`,
        variant: "success",
      });
      
      // Add player to leaderboard
      const newLeaderboard = [...leaderboard, {
        name: "You",
        completed: playerStats.gamesCompleted,
        prize: prizePool,
        time: playerStats.totalTime,
      }].sort((a, b) => b.prize - a.prize).slice(0, 5);
      
      setLeaderboard(newLeaderboard);
      setGameStatus("idle");
    }
  };
  
  // Retry current level
  const retryLevel = () => {
    if (lives > 0) {
      setTimeLeft(currentGame.timeLimit);
      setUserQuery("");
      setGameStatus("playing");
      setTimerActive(true);
    } else {
      // Game over
      toast({
        title: "Game Over",
        description: "You've been eliminated from SQL Squid Game.",
        variant: "destructive",
      });
      setGameStatus("idle");
      setGameStarted(false);
    }
  };
  
  // Format time as mm:ss
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-pink-500 py-4 px-6 flex justify-between items-center bg-black">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center text-white hover:text-pink-400 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="font-bold">Back to SQL.xyz</span>
          </Link>
        </div>
        <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
          SQL Squid Game
        </h1>
        <div className="flex space-x-2">
          {gameStarted && (
            <>
              <Badge variant="outline" className="bg-pink-950 text-pink-300 border-pink-700 py-1 px-3">
                Lives: {Array(lives).fill("❤️").join("")}
              </Badge>
              <Badge variant="outline" className="bg-cyan-950 text-cyan-300 border-cyan-700 py-1 px-3">
                Prize: ₩{prizePool.toLocaleString()}
              </Badge>
            </>
          )}
        </div>
      </header>
      
      {/* Main Game Area */}
      <main className="flex-1 p-6 relative">
        {!gameStarted ? (
          /* Game Intro Screen */
          <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center">
            <div className="absolute inset-0 bg-[url('/squid-game-bg.jpg')] bg-cover bg-center opacity-20 z-0"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-center">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#FF0080" strokeWidth="2"/>
                  <polygon points="50,10 90,90 10,90" fill="none" stroke="#0EA5E9" strokeWidth="2"/>
                  <rect x="30" y="30" width="40" height="40" fill="none" stroke="#FF0080" strokeWidth="2"/>
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold">Welcome to SQL Squid Game</h2>
              <p className="text-xl max-w-2xl mx-auto text-gray-300">
                In the world of data, those who cannot query are destined to fail. Compete in six deadly SQL challenges to win the ₩45.6 billion prize. Do you have what it takes to survive?
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <Card className="bg-black border-pink-800 hover:border-pink-500 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Code className="h-12 w-12 mb-4 mx-auto text-pink-500" />
                    <h3 className="text-lg font-bold">6 SQL Challenges</h3>
                    <p className="text-gray-400">Master queries from basic SELECT to complex window functions</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black border-cyan-800 hover:border-cyan-500 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 mb-4 mx-auto text-cyan-500" />
                    <h3 className="text-lg font-bold">₩45.6 Billion Prize</h3>
                    <p className="text-gray-400">Earn ₩100 million for each successful query</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black border-pink-800 hover:border-pink-500 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Skull className="h-12 w-12 mb-4 mx-auto text-pink-500" />
                    <h3 className="text-lg font-bold">Deadly Stakes</h3>
                    <p className="text-gray-400">3 lives to complete all challenges or face elimination</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 space-x-4">
                <Button 
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-xl"
                  onClick={startGame}
                >
                  Start Game
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-950">
                      Leaderboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border-cyan-700 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-cyan-300">SQL Squid Game Leaderboard</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-cyan-800">
                            <th className="text-left p-2">Rank</th>
                            <th className="text-left p-2">Player</th>
                            <th className="text-right p-2">Games</th>
                            <th className="text-right p-2">Prize</th>
                            <th className="text-right p-2">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((player, index) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">{player.name}</td>
                              <td className="p-2 text-right">{player.completed}/6</td>
                              <td className="p-2 text-right">₩{(player.prize / 1000000).toFixed(0)}M</td>
                              <td className="p-2 text-right">{formatTime(player.time)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ) : (
          /* Active Game Screen */
          <div className="h-full grid grid-cols-12 gap-6">
            {/* Game Visualization */}
            <div className="col-span-5 relative rounded-lg overflow-hidden border border-pink-800" 
                 style={{backgroundImage: currentGame.backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="absolute inset-0 bg-black bg-opacity-70"></div>
              
              <div className="relative z-10 h-full flex flex-col p-6">
                {/* Game header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-pink-400">Game {currentLevel}: {currentGame.name}</h2>
                  <p className="text-gray-300">{currentGame.description}</p>
                </div>
                
                {/* Game status */}
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="w-48 h-48 mb-6"
                      style={{backgroundImage: currentGame.characterImage, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                  
                  {gameStatus === "playing" && (
                    <Alert className="bg-pink-950 border-pink-800">
                      <AlertTitle className="text-pink-300">Challenge Active</AlertTitle>
                      <AlertDescription className="text-gray-300">
                        {currentGame.instruction}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {gameStatus === "success" && (
                    <Alert className="bg-green-950 border-green-800">
                      <AlertTitle className="text-green-300">Success!</AlertTitle>
                      <AlertDescription className="text-gray-300">
                        You've successfully completed this challenge!
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {gameStatus === "failed" && (
                    <Alert className="bg-red-950 border-red-800">
                      <AlertTitle className="text-red-300">Eliminated!</AlertTitle>
                      <AlertDescription className="text-gray-300">
                        {currentGame.eliminationPenalty}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {/* Game controls */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-mono">
                      {formatTime(timeLeft)}
                    </div>
                    <div>
                      {gameStatus === "playing" && (
                        <Button 
                          className="bg-pink-600 hover:bg-pink-700"
                          onClick={checkSolution}
                        >
                          Execute Query
                        </Button>
                      )}
                      
                      {gameStatus === "success" && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={nextLevel}
                        >
                          Next Challenge <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                      
                      {gameStatus === "failed" && (
                        <Button 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={retryLevel}
                        >
                          <RefreshCw className="mr-1 h-4 w-4" /> Retry
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Progress 
                    value={(timeLeft / currentGame.timeLimit) * 100} 
                    className={`h-2 bg-gray-800 ${gameStatus === "playing" ? "bg-pink-500" : gameStatus === "success" ? "bg-green-500" : "bg-red-500"}`}
                  />
                </div>
              </div>
            </div>
            
            {/* SQL Editor */}
            <div className="col-span-7 flex flex-col rounded-lg overflow-hidden border border-cyan-800 bg-black bg-opacity-90">
              <div className="p-4 border-b border-cyan-800 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400">SQL Editor</h3>
                  <div className="flex gap-2 mt-1">
                    {currentGame.sqlConcepts.map((concept, i) => (
                      <Badge key={i} variant="outline" className="bg-cyan-950 border-cyan-800 text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-cyan-700 text-cyan-400 hover:bg-cyan-950"
                    onClick={() => setShowSolution(!showSolution)}
                  >
                    {showSolution ? "Hide Solution" : "Hint"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-pink-700 text-pink-400 hover:bg-pink-950"
                    onClick={() => setUserQuery(currentGame.template)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col p-4 space-y-4">
                <div className="flex-1 font-mono bg-gray-950 rounded p-4 border border-gray-800 overflow-auto focus-within:border-cyan-600 transition-colors">
                  <textarea
                    ref={sqlEditorRef}
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-cyan-300"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder={currentGame.template}
                    spellCheck="false"
                  />
                </div>
                
                {showSolution && (
                  <div className="font-mono bg-pink-950 rounded p-4 border border-pink-800">
                    <h4 className="text-pink-300 mb-2">Solution Template:</h4>
                    <pre className="text-gray-300 whitespace-pre-wrap">{currentGame.template}</pre>
                    
                    <Separator className="my-2 bg-pink-800" />
                    
                    <h4 className="text-pink-300 mb-2">Fill in with:</h4>
                    <ul className="list-disc pl-5 text-gray-300 space-y-1">
                      {currentGame.solution.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Game Progress Footer */}
      {gameStarted && (
        <footer className="bg-gray-950 border-t border-pink-800 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex space-x-8">
              <div>
                <span className="text-gray-400">Level:</span>
                <span className="ml-2 text-pink-400 font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cyan-800 text-cyan-400 hover:bg-cyan-950">
                    <Users className="mr-1 h-4 w-4" /> Players
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-cyan-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-cyan-300">Current Players</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <Card className="bg-black border-pink-800">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                            456
                          </div>
                          <div>
                            <h3 className="font-bold">You (Player 456)</h3>
                            <p className="text-gray-400">Debt: ₩160,000,000</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black border-pink-800">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                            067
                          </div>
                          <div>
                            <h3 className="font-bold">Kang Sae-byeok (Player 067)</h3>
                            <p className="text-gray-400">Debt: ₩120,000,000</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black border-pink-800">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                            218
                          </div>
                          <div>
                            <h3 className="font-bold">Cho Sang-woo (Player 218)</h3>
                            <p className="text-gray-400">Debt: ₩300,000,000</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-pink-800 text-pink-400 hover:bg-pink-950">
                    <Award className="mr-1 h-4 w-4" /> Statistics
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-pink-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-pink-300">Your Game Statistics</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-black border-cyan-800">
                        <CardContent className="p-4 text-center">
                          <h3 className="text-gray-400">Games Completed</h3>
                          <p className="text-3xl font-bold text-cyan-400">{playerStats.gamesCompleted}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-black border-pink-800">
                        <CardContent className="p-4 text-center">
                          <h3 className="text-gray-400">Total Time</h3>
                          <p className="text-3xl font-bold text-pink-400">{formatTime(playerStats.totalTime)}</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-black border-cyan-800">
                        <CardContent className="p-4 text-center">
                          <h3 className="text-gray-400">Deaths</h3>
                          <p className="text-3xl font-bold text-cyan-400">{playerStats.deaths}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-2">Game Progress</h3>
                      <Progress value={(playerStats.gamesCompleted / games.length) * 100} className="h-3 bg-gray-800" />
                      <p className="text-sm text-gray-400 mt-1 text-right">{playerStats.gamesCompleted} of {games.length} games</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 mb-2">Prize Progress</h3>
                      <Progress value={(prizePool / 45600000000) * 100} className="h-3 bg-gray-800" />
                      <p className="text-sm text-gray-400 mt-1 text-right">₩{prizePool.toLocaleString()} of ₩45,600,000,000</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </footer>
      )}
      
      <Toaster />
    </div>
  );
}

function useToast() {
    return {
        toast: ({ title, description, variant }: { title: string; description: string; variant: string }) => {
            console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
        },
    };
}