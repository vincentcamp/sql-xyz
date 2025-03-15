"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  RocketIcon,
  DatabaseIcon,
  CodeIcon,
  LayoutGridIcon,
  BookOpenIcon,
  TrophyIcon,
  RefreshCwIcon,
  HelpCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZapIcon,
  ShieldIcon,
  TargetIcon,
  CpuIcon,
  GlobeIcon,
  SunIcon,
  PlusCircleIcon,
  InfoIcon,
  SettingsIcon,
  SendIcon,
  XIcon,
  CheckIcon,
  ArrowRightIcon,
  HomeIcon,
  MenuIcon,
  GamepadIcon,
} from "lucide-react";

// -----------------------------------------------------------------------
// 1. Interfaces (single set, no duplicates)
// -----------------------------------------------------------------------
interface Ship {
  ship_id: number;
  ship_type: string;
  position_x: number;
  position_y: number;
  health: number;
  attack: number;
  speed: number;
  range: number;
}

interface EnemyShip {
  enemy_id: number;
  ship_type: string;
  position_x: number;
  position_y: number;
  health: number;
  attack: number;
}

interface Planet {
  planet_id: number;
  position_x: number;
  position_y: number;
  size: number;
  resource_multiplier: number;
}

interface Asteroid {
  asteroid_id: number;
  position_x: number;
  position_y: number;
  resource_value: number;
}

interface Star {
  id: number;
  position_x: number;
  position_y: number;
  size: number;
  brightness: number;
}

interface Resources {
  credits: number;
  fuel: number;
  materials: number;
}

interface GameState {
  playerShips: Ship[];
  enemyShips: EnemyShip[];
  planets: Planet[];
  asteroids: Asteroid[];
  stars: Star[];
  resources: Resources;
  score: number;
  turnsCompleted: number;
  challengesCompleted: Record<string, boolean>;
}

interface QueryResult {
  success: boolean;
  message: string;
  data: any | null;
  affectedRows: number;
  isChallengeSolved: boolean;
}

// -----------------------------------------------------------------------
// 2. Game Constants, Setup, and Shared Data
// -----------------------------------------------------------------------
const GRID_SIZE = 20; // Size of the space grid
const INITIAL_SHIPS = 3; // Starting number of ships
const INITIAL_RESOURCES = 1000; // Starting resources
const STAR_COUNT = 25; // Number of stars in the background
const PLANET_COUNT = 5; // Number of planets
const ASTEROID_COUNT = 8; // Number of asteroid fields
const ENEMY_COUNT = 10; // Number of enemy ships

const SHIP_TYPES = {
  SCOUT: {
    name: "Scout",
    cost: 500,
    health: 30,
    attack: 10,
    speed: 3,
    range: 3,
    color: "#60A5FA",
  },
  DESTROYER: {
    name: "Destroyer",
    cost: 1200,
    health: 80,
    attack: 25,
    speed: 2,
    range: 4,
    color: "#34D399",
  },
  BATTLESHIP: {
    name: "Battleship",
    cost: 3000,
    health: 200,
    attack: 50,
    speed: 1,
    range: 5,
    color: "#F472B6",
  },
};

// SQL challenges for the game
const SQL_CHALLENGES = [
  {
    id: "move_ship",
    title: "Move Your Ship",
    description: "Write a query to move your ship to coordinates (5, 7)",
    hint: "Use UPDATE to modify the position_x and position_y columns",
    solution: "UPDATE my_ships SET position_x = 5, position_y = 7 WHERE ship_id = 1;",
    points: 100,
    successMessage: "Ship coordinates updated successfully!",
  },
  {
    id: "gather_resources",
    title: "Gather Resources",
    description: "Collect resources from a nearby asteroid (asteroid_id = 2)",
    hint: "JOIN the asteroids and my_ships tables to find nearby asteroids",
    solution:
      "UPDATE my_resources SET credits = credits + (SELECT resource_value FROM asteroids WHERE asteroid_id = 2);",
    points: 150,
    successMessage: "Resources collected successfully!",
  },
  {
    id: "attack_enemy",
    title: "Attack Enemy Ship",
    description: "Attack an enemy ship within your range",
    hint: "Use a subquery to calculate distance and SELECT enemies within range",
    solution:
      "UPDATE enemy_ships SET health = health - (SELECT attack FROM my_ships WHERE ship_id = 1) WHERE enemy_id = 3;",
    points: 200,
    successMessage: "Enemy ship attacked successfully!",
  },
  {
    id: "upgrade_ship",
    title: "Upgrade Your Ship",
    description: "Use your resources to upgrade a ship's attack power",
    hint: "UPDATE ship stats but check if you have enough resources first",
    solution:
      "UPDATE my_ships SET attack = attack + 10 WHERE ship_id = 2; UPDATE my_resources SET credits = credits - 300;",
    points: 250,
    successMessage: "Ship upgraded successfully!",
  },
  {
    id: "deploy_fleet",
    title: "Strategic Fleet Deployment",
    description: "Deploy your ships to surround an enemy base",
    hint: "Use multiple UPDATE statements with different coordinates",
    solution:
      "UPDATE my_ships SET position_x = 12, position_y = 8 WHERE ship_id = 1; UPDATE my_ships SET position_x = 10, position_y = 10 WHERE ship_id = 2;",
    points: 300,
    successMessage: "Fleet deployed strategically!",
  },
  {
    id: "complex_query",
    title: "Advanced Battle Tactics",
    description: "Find and attack all enemy ships within range of your destroyer",
    hint: "Use a JOIN with a calculated distance formula, then UPDATE multiple rows",
    solution:
      "UPDATE enemy_ships SET health = health - 15 WHERE enemy_id IN (SELECT e.enemy_id FROM enemy_ships e JOIN my_ships m ON (POW(e.position_x - m.position_x, 2) + POW(e.position_y - m.position_y, 2)) <= POW(m.range, 2) WHERE m.ship_type = 'DESTROYER');",
    points: 400,
    successMessage: "Executed advanced battle tactics successfully!",
  },
];

// Tutorial steps
const TUTORIAL_STEPS = [
  {
    title: "Welcome to Schemaverse!",
    content:
      "In this game, you'll command a fleet of spaceships using SQL queries. Let's learn how to play!",
  },
  {
    title: "Understanding the Universe",
    content:
      "The game takes place on a grid representing space. You'll see your ships, enemy ships, planets, and asteroids.",
  },
  {
    title: "Managing Your Fleet",
    content:
      "You control your ships by writing SQL queries. For example, to move a ship, you would update its position_x and position_y values.",
  },
  {
    title: "Gathering Resources",
    content:
      "Collect resources from asteroids by sending your ships near them and executing resource collection queries.",
  },
  {
    title: "Combat",
    content:
      "Attack enemy ships by writing queries that update the health of enemy ships. Different ships have different attack powers and ranges.",
  },
  {
    title: "Upgrading Your Fleet",
    content:
      "Use resources to upgrade your existing ships or purchase new ones by inserting new records into your fleet table.",
  },
  {
    title: "Winning the Game",
    content:
      "Earn points by completing challenges, destroying enemy ships, collecting resources, and controlling territory. The higher your score, the better!",
  },
  {
    title: "Ready to Play?",
    content:
      "Now it's your turn! Start with the first challenge and work your way up to become a Schemaverse master!",
  },
];

// Game database schema (for reference in the Help modal)
const GAME_SCHEMA = [
  {
    table: "my_ships",
    description: "Your fleet of spaceships",
    columns: [
      {
        name: "ship_id",
        type: "INTEGER",
        description: "Unique identifier for each ship",
      },
      {
        name: "ship_type",
        type: "TEXT",
        description: "Type of ship (SCOUT, DESTROYER, BATTLESHIP)",
      },
      {
        name: "position_x",
        type: "INTEGER",
        description: "X-coordinate position in space",
      },
      {
        name: "position_y",
        type: "INTEGER",
        description: "Y-coordinate position in space",
      },
      { name: "health", type: "INTEGER", description: "Current health points" },
      { name: "attack", type: "INTEGER", description: "Attack power" },
      { name: "speed", type: "INTEGER", description: "Movement speed" },
      { name: "range", type: "INTEGER", description: "Attack range" },
    ],
  },
  {
    table: "my_resources",
    description: "Your available resources",
    columns: [
      {
        name: "credits",
        type: "INTEGER",
        description: "Available credits for purchases and upgrades",
      },
      { name: "fuel", type: "INTEGER", description: "Fuel for special movements" },
      {
        name: "materials",
        type: "INTEGER",
        description: "Materials for repairs and upgrades",
      },
    ],
  },
  {
    table: "enemy_ships",
    description: "Enemy ships in the universe",
    columns: [
      {
        name: "enemy_id",
        type: "INTEGER",
        description: "Unique identifier for each enemy ship",
      },
      { name: "ship_type", type: "TEXT", description: "Type of ship" },
      { name: "position_x", type: "INTEGER", description: "X-coordinate position" },
      { name: "position_y", type: "INTEGER", description: "Y-coordinate position" },
      { name: "health", type: "INTEGER", description: "Current health points" },
      { name: "attack", type: "INTEGER", description: "Attack power" },
    ],
  },
  {
    table: "planets",
    description: "Planets in the universe",
    columns: [
      {
        name: "planet_id",
        type: "INTEGER",
        description: "Unique identifier for each planet",
      },
      { name: "position_x", type: "INTEGER", description: "X-coordinate position" },
      { name: "position_y", type: "INTEGER", description: "Y-coordinate position" },
      { name: "size", type: "INTEGER", description: "Size of the planet" },
      {
        name: "resource_multiplier",
        type: "FLOAT",
        description: "Resource bonus multiplier",
      },
    ],
  },
  {
    table: "asteroids",
    description: "Asteroid fields with resources",
    columns: [
      {
        name: "asteroid_id",
        type: "INTEGER",
        description: "Unique identifier for each asteroid field",
      },
      {
        name: "position_x",
        type: "INTEGER",
        description: "X-coordinate position",
      },
      {
        name: "position_y",
        type: "INTEGER",
        description: "Y-coordinate position",
      },
      {
        name: "resource_value",
        type: "INTEGER",
        description: "Resource value when collected",
      },
    ],
  },
];

// Basic SQL commands reference for help panel
const SQL_COMMANDS = [
  {
    command: "SELECT",
    description: "Retrieve data from a table",
    example: "SELECT * FROM my_ships WHERE health > 50;",
  },
  {
    command: "UPDATE",
    description: "Modify existing data in a table",
    example: "UPDATE my_ships SET position_x = 10, position_y = 15 WHERE ship_id = 1;",
  },
  {
    command: "INSERT",
    description: "Add new data to a table",
    example: "INSERT INTO my_ships (ship_type, position_x, position_y) VALUES ('SCOUT', 5, 5);",
  },
  {
    command: "DELETE",
    description: "Remove data from a table",
    example: "DELETE FROM my_ships WHERE health <= 0;",
  },
  {
    command: "JOIN",
    description: "Combine rows from different tables",
    example:
      "SELECT s.ship_id, p.resource_multiplier FROM my_ships s JOIN planets p ON s.position_x = p.position_x AND s.position_y = p.position_y;",
  },
  {
    command: "Subqueries",
    description: "Nested queries inside another query",
    example:
      "UPDATE enemy_ships SET health = health - (SELECT attack FROM my_ships WHERE ship_id = 2) WHERE enemy_id = 3;",
  },
];

// -----------------------------------------------------------------------
// 3. Initial Game State Generator
// -----------------------------------------------------------------------
const generateInitialGameState = (): GameState => {
  // Generate player ships
  const playerShips: Ship[] = [];
  for (let i = 0; i < INITIAL_SHIPS; i++) {
    const shipType = i === 0 ? "SCOUT" : i === 1 ? "DESTROYER" : "BATTLESHIP";
    const shipStats = SHIP_TYPES[shipType as keyof typeof SHIP_TYPES];
    playerShips.push({
      ship_id: i + 1,
      ship_type: shipType,
      position_x: Math.floor(Math.random() * (GRID_SIZE / 2)) + 1,
      position_y: Math.floor(Math.random() * (GRID_SIZE / 2)) + 1,
      health: shipStats.health,
      attack: shipStats.attack,
      speed: shipStats.speed,
      range: shipStats.range,
    });
  }

  // Generate enemy ships
  const enemyShips: EnemyShip[] = [];
  for (let i = 0; i < ENEMY_COUNT; i++) {
    const shipType = i % 3 === 0 ? "SCOUT" : i % 3 === 1 ? "DESTROYER" : "BATTLESHIP";
    const shipStats = SHIP_TYPES[shipType as keyof typeof SHIP_TYPES];
    enemyShips.push({
      enemy_id: i + 1,
      ship_type: shipType,
      position_x: Math.floor(Math.random() * (GRID_SIZE / 2)) + GRID_SIZE / 2,
      position_y: Math.floor(Math.random() * (GRID_SIZE / 2)) + GRID_SIZE / 2,
      health: shipStats.health,
      attack: shipStats.attack,
    });
  }

  // Generate planets
  const planets: Planet[] = [];
  for (let i = 0; i < PLANET_COUNT; i++) {
    planets.push({
      planet_id: i + 1,
      position_x: Math.floor(Math.random() * GRID_SIZE),
      position_y: Math.floor(Math.random() * GRID_SIZE),
      size: Math.floor(Math.random() * 3) + 1, // 1 to 3
      resource_multiplier: parseFloat((Math.random() * 1.5 + 0.5).toFixed(1)), // 0.5 to 2.0
    });
  }

  // Generate asteroids
  const asteroids: Asteroid[] = [];
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    asteroids.push({
      asteroid_id: i + 1,
      position_x: Math.floor(Math.random() * GRID_SIZE),
      position_y: Math.floor(Math.random() * GRID_SIZE),
      resource_value: Math.floor(Math.random() * 500) + 100, // 100 to 600
    });
  }

  // Generate stars (just for background visuals)
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      id: i,
      position_x: Math.random() * 100, // Percentage
      position_y: Math.random() * 100, // Percentage
      size: Math.random() * 2 + 0.5, // 0.5 to 2.5
      brightness: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
    });
  }

  // Return the full initial state
  return {
    playerShips,
    enemyShips,
    planets,
    asteroids,
    stars,
    resources: {
      credits: INITIAL_RESOURCES,
      fuel: 100,
      materials: 200,
    },
    score: 0,
    turnsCompleted: 0,
    challengesCompleted: {},
  };
};

// -----------------------------------------------------------------------
// 4. Simple SQL Parser + Query Handlers
// -----------------------------------------------------------------------
const executeQuery = (
  query: string,
  gameState: GameState,
  setGameState: (s: GameState) => void,
  activeChallengeId: string | null = null
): QueryResult => {
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");

  let results: QueryResult = {
    success: false,
    message: "Query executed but nothing happened.",
    data: null,
    affectedRows: 0,
    isChallengeSolved: false,
  };

  try {
    // Check command type
    if (normalizedQuery.startsWith("select")) {
      results = handleSelectQuery(normalizedQuery, gameState);
    } else if (normalizedQuery.startsWith("update")) {
      results = handleUpdateQuery(normalizedQuery, gameState, setGameState);
    } else if (normalizedQuery.startsWith("insert")) {
      results = handleInsertQuery(normalizedQuery, gameState, setGameState);
    } else if (normalizedQuery.startsWith("delete")) {
      results = handleDeleteQuery(normalizedQuery, gameState, setGameState);
    } else {
      results.message =
        "Unrecognized SQL command. Try SELECT, UPDATE, INSERT, or DELETE.";
      return results;
    }

    // Check if the current challenge was solved
    if (activeChallengeId) {
      const activeChallenge = SQL_CHALLENGES.find((c) => c.id === activeChallengeId);
      if (activeChallenge) {
        const normalizedSolution = activeChallenge.solution
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");

        // Very naive check: see if the user's query contains the first part of the challenge solution
        if (normalizedQuery.includes(normalizedSolution.split(";")[0])) {
          results.isChallengeSolved = true;
          results.message = activeChallenge.successMessage;

          // Update game state with challenge completion and score
          const newState = {
            ...gameState,
            score: gameState.score + activeChallenge.points,
            challengesCompleted: {
              ...gameState.challengesCompleted,
              [activeChallengeId]: true,
            },
          };
          setGameState(newState);
        }
      }
    }

    // Process a game turn after each successful query
    if (results.success) {
      processGameTurn(gameState, setGameState);
    }
    return results;
  } catch (error: any) {
    return {
      success: false,
      message: `Error executing query: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }
};

// SELECT
const handleSelectQuery = (
  query: string,
  gameState: GameState
): QueryResult => {
  const { playerShips, enemyShips, planets, asteroids, resources } = gameState;
  let data: any[] | null = null;

  if (query.includes("from my_ships")) {
    data = playerShips;
  } else if (query.includes("from enemy_ships")) {
    data = enemyShips;
  } else if (query.includes("from planets")) {
    data = planets;
  } else if (query.includes("from asteroids")) {
    data = asteroids;
  } else if (query.includes("from my_resources")) {
    data = [resources];
  }

  // Very simple WHERE parsing
  if (data && query.includes("where")) {
    const whereClause = query.split("where")[1].trim();
    if (whereClause.includes("=")) {
      const [field, rawValue] = whereClause.split("=").map((s) => s.trim());
      const numValue = parseFloat(rawValue);

      if (!isNaN(numValue)) {
        data = data.filter((item) => item[field] === numValue);
      } else {
        const strValue = rawValue.replace(/['"`]/g, "");
        data = data.filter(
          (item) => String(item[field]).toLowerCase() === strValue
        );
      }
    }
  }

  return {
    success: true,
    message: `Query returned ${data ? data.length : 0} rows.`,
    data: data || [],
    affectedRows: 0,
    isChallengeSolved: false,
  };
};

// UPDATE
const handleUpdateQuery = (
  query: string,
  gameState: GameState,
  setGameState: (s: GameState) => void
): QueryResult => {
  let { playerShips, enemyShips, planets, asteroids, resources } = gameState;
  let affectedRows = 0;

  // Which table?
  let table: string | null = null;
  if (query.includes("update my_ships")) {
    table = "my_ships";
  } else if (query.includes("update enemy_ships")) {
    table = "enemy_ships";
  } else if (query.includes("update planets")) {
    table = "planets";
  } else if (query.includes("update asteroids")) {
    table = "asteroids";
  } else if (query.includes("update my_resources")) {
    table = "my_resources";
  }

  if (!table) {
    return {
      success: false,
      message: "Unknown table in UPDATE statement.",
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }

  // Extract SET clause
  let setClause = "";
  if (query.includes("set")) {
    const parts = query.split("set")[1].split("where");
    setClause = parts[0].trim();
  }

  if (!setClause) {
    return {
      success: false,
      message: "Missing SET clause in UPDATE statement.",
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }

  // Parse assignments
  const assignments: Record<string, string | number> = {};
  setClause.split(",").forEach((assignment) => {
    const [fieldRaw, valueRaw] = assignment.split("=").map((s) => s.trim());
    const numValue = parseFloat(valueRaw);
    if (!isNaN(numValue)) {
      assignments[fieldRaw] = numValue;
    } else {
      assignments[fieldRaw] = valueRaw.replace(/['"`]/g, "");
    }
  });

  // Extract WHERE condition
  let whereCondition: ((item: any) => boolean) | null = null;
  if (query.includes("where")) {
    const whereClause = query.split("where")[1].trim();
    if (whereClause.includes("=")) {
      const [fieldRaw, valueRaw] = whereClause.split("=").map((s) => s.trim());
      const numValue = parseFloat(valueRaw);
      if (!isNaN(numValue)) {
        whereCondition = (item) => item[fieldRaw] === numValue;
      } else {
        const strValue = valueRaw.replace(/['"`]/g, "");
        whereCondition = (item) => String(item[fieldRaw]).toLowerCase() === strValue;
      }
    }
  }

  let newState = { ...gameState };

  if (table === "my_ships") {
    newState.playerShips = playerShips.map((ship) => {
      if (!whereCondition || whereCondition(ship)) {
        affectedRows++;
        return { ...ship, ...assignments };
      }
      return ship;
    });
  } else if (table === "enemy_ships") {
    newState.enemyShips = enemyShips.map((enemy) => {
      if (!whereCondition || whereCondition(enemy)) {
        affectedRows++;
        return { ...enemy, ...assignments };
      }
      return enemy;
    });
  } else if (table === "planets") {
    newState.planets = planets.map((planet) => {
      if (!whereCondition || whereCondition(planet)) {
        affectedRows++;
        return { ...planet, ...assignments };
      }
      return planet;
    });
  } else if (table === "asteroids") {
    newState.asteroids = asteroids.map((asteroid) => {
      if (!whereCondition || whereCondition(asteroid)) {
        affectedRows++;
        return { ...asteroid, ...assignments };
      }
      return asteroid;
    });
  } else if (table === "my_resources") {
    // Single object
    if (!whereCondition || whereCondition(resources)) {
      affectedRows++;
      newState.resources = { ...resources, ...assignments };
    }
  }

  setGameState(newState);

  return {
    success: true,
    message: `Updated ${affectedRows} rows.`,
    data: null,
    affectedRows,
    isChallengeSolved: false,
  };
};

// INSERT
const handleInsertQuery = (
  query: string,
  gameState: GameState,
  setGameState: (s: GameState) => void
): QueryResult => {
  let { playerShips, resources } = gameState;

  if (!query.includes("insert into my_ships")) {
    return {
      success: false,
      message: "INSERT is only supported for the my_ships table in this demo.",
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }

  // Identify ship type
  let shipType: "SCOUT" | "DESTROYER" | "BATTLESHIP" | null = null;
  if (query.includes("'scout'") || query.includes('"scout"')) {
    shipType = "SCOUT";
  } else if (query.includes("'destroyer'") || query.includes('"destroyer"')) {
    shipType = "DESTROYER";
  } else if (query.includes("'battleship'") || query.includes('"battleship"')) {
    shipType = "BATTLESHIP";
  }

  if (!shipType) {
    return {
      success: false,
      message: "Invalid ship_type. Must be 'SCOUT', 'DESTROYER', or 'BATTLESHIP'.",
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }

  const shipCost = SHIP_TYPES[shipType].cost;
  if (resources.credits < shipCost) {
    return {
      success: false,
      message: `Not enough credits to purchase a ${shipType.toLowerCase()}. Needed: ${shipCost}, Available: ${resources.credits}`,
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }

  // Parse position
  let position_x = 0;
  let position_y = 0;

  const matchX = query.match(/position_x.*?(\d+)/);
  if (matchX) position_x = parseInt(matchX[1]);
  const matchY = query.match(/position_y.*?(\d+)/);
  if (matchY) position_y = parseInt(matchY[1]);

  const shipStats = SHIP_TYPES[shipType];
  const newShip: Ship = {
    ship_id: playerShips.length > 0 ? Math.max(...playerShips.map((s) => s.ship_id)) + 1 : 1,
    ship_type: shipType,
    position_x: position_x || Math.floor(Math.random() * GRID_SIZE),
    position_y: position_y || Math.floor(Math.random() * GRID_SIZE),
    health: shipStats.health,
    attack: shipStats.attack,
    speed: shipStats.speed,
    range: shipStats.range,
  };

  // Update state
  setGameState({
    ...gameState,
    playerShips: [...playerShips, newShip],
    resources: {
      ...resources,
      credits: resources.credits - shipCost,
    },
    score: gameState.score + 50, // Bonus
  });

  return {
    success: true,
    message: `Successfully purchased and deployed a new ${shipType}!`,
    data: newShip,
    affectedRows: 1,
    isChallengeSolved: false,
  };
};

// DELETE
const handleDeleteQuery = (
  query: string,
  gameState: GameState,
  setGameState: (s: GameState) => void
): QueryResult => {
  let { playerShips } = gameState;

  if (!query.includes("delete from my_ships")) {
    return {
      success: false,
      message: "DELETE is only supported for the my_ships table in this demo.",
      data: null,
      affectedRows: 0,
      isChallengeSolved: false,
    };
  }

  let whereCondition: ((ship: Ship) => boolean) | null = null;
  let affectedRows = 0;

  if (query.includes("where")) {
    const whereClause = query.split("where")[1].trim();
    if (whereClause.includes("=")) {
      const [fieldRaw, valueRaw] = whereClause.split("=").map((s) => s.trim());
      const numValue = parseFloat(valueRaw);
      if (!isNaN(numValue)) {
        whereCondition = (ship) => (ship as any)[fieldRaw] === numValue;
      } else {
        const strValue = valueRaw.replace(/['"`]/g, "");
        whereCondition = (ship) =>
          String((ship as any)[fieldRaw]).toLowerCase() === strValue;
      }
    }
  }

  let newPlayerShips: Ship[] = [];
  if (whereCondition) {
    newPlayerShips = playerShips.filter((ship) => {
      const shouldDelete = whereCondition!(ship);
      if (shouldDelete) affectedRows++;
      return !shouldDelete;
    });
  } else {
    // No WHERE => delete all
    affectedRows = playerShips.length;
  }

  if (!whereCondition) newPlayerShips = [];

  setGameState({
    ...gameState,
    playerShips: newPlayerShips,
  });

  return {
    success: true,
    message: `Deleted ${affectedRows} ships.`,
    data: null,
    affectedRows,
    isChallengeSolved: false,
  };
};

// -----------------------------------------------------------------------
// 5. Game Turn Processing (AI, resource auto-collection, etc.)
// -----------------------------------------------------------------------
const processGameTurn = (gameState: GameState, setGameState: (s: GameState) => void): number => {
  const { playerShips, enemyShips, planets, asteroids, resources, turnsCompleted } = gameState;

  let newResources = { ...resources };
  let newPlayerShips = [...playerShips];
  let newEnemyShips = [...enemyShips];
  let scoreIncrease = 0;

  // Auto-collect from asteroids + resource bonuses
  playerShips.forEach((ship) => {
    asteroids.forEach((asteroid) => {
      const distance = Math.sqrt(
        Math.pow(ship.position_x - asteroid.position_x, 2) +
          Math.pow(ship.position_y - asteroid.position_y, 2)
      );
      if (distance <= 1) {
        newResources.credits += asteroid.resource_value;
        scoreIncrease += Math.floor(asteroid.resource_value / 10);
      }
    });

    // Bonus from planets
    planets.forEach((planet) => {
      const distance = Math.sqrt(
        Math.pow(ship.position_x - planet.position_x, 2) +
          Math.pow(ship.position_y - planet.position_y, 2)
      );
      if (distance <= planet.size) {
        const bonus = Math.floor(50 * planet.resource_multiplier);
        newResources.credits += bonus;
        scoreIncrease += Math.floor(bonus / 5);
      }
    });

    // Enemy ships AI: move + attack
    newEnemyShips = newEnemyShips.map((enemy) => {
      if (enemy.health <= 0) return enemy;
      const distance = Math.sqrt(
        Math.pow(ship.position_x - enemy.position_x, 2) +
          Math.pow(ship.position_y - enemy.position_y, 2)
      );

      const updatedEnemy = { ...enemy };
      // Attack if in range
      if (distance <= 2) {
        const shipIndex = newPlayerShips.findIndex((s) => s.ship_id === ship.ship_id);
        if (shipIndex >= 0) {
          newPlayerShips[shipIndex] = {
            ...newPlayerShips[shipIndex],
            health: newPlayerShips[shipIndex].health - enemy.attack,
          };
        }
      }
      // Move enemy every 3 turns
      else if (turnsCompleted % 3 === 0) {
        const dx = ship.position_x - enemy.position_x;
        const dy = ship.position_y - enemy.position_y;
        if (Math.abs(dx) > Math.abs(dy)) {
          updatedEnemy.position_x += dx > 0 ? 1 : -1;
        } else {
          updatedEnemy.position_y += dy > 0 ? 1 : -1;
        }
      }
      return updatedEnemy;
    });

    // Player ships attack if enemy is in range
    enemyShips.forEach((enemy) => {
      if (enemy.health <= 0) return;
      const distance = Math.sqrt(
        Math.pow(ship.position_x - enemy.position_x, 2) +
          Math.pow(ship.position_y - enemy.position_y, 2)
      );
      if (distance <= ship.range) {
        const enemyIndex = newEnemyShips.findIndex((e) => e.enemy_id === enemy.enemy_id);
        if (enemyIndex >= 0) {
          const damage = ship.attack;
          newEnemyShips[enemyIndex] = {
            ...newEnemyShips[enemyIndex],
            health: newEnemyShips[enemyIndex].health - damage,
          };
          scoreIncrease += Math.floor(damage);
          if (newEnemyShips[enemyIndex].health <= 0) {
            scoreIncrease += 100; // Extra for kill
          }
        }
      }
    });
  });

  // Remove destroyed player ships
  newPlayerShips = newPlayerShips.filter((ship) => ship.health > 0);

  // Update state
  setGameState({
    ...gameState,
    playerShips: newPlayerShips,
    enemyShips: newEnemyShips,
    resources: newResources,
    score: gameState.score + scoreIncrease,
    turnsCompleted: turnsCompleted + 1,
  });

  // Return how many enemies were destroyed
  const destroyedEnemies =
    enemyShips.filter((e) => e.health > 0).length -
    newEnemyShips.filter((e) => e.health > 0).length;
  return destroyedEnemies;
};

// -----------------------------------------------------------------------
// 6. Individual Components (Ship, Planet, Asteroid, Star, etc.)
// -----------------------------------------------------------------------
const ShipComponent = ({
  ship,
  type = "player",
  size = 10,
}: {
  ship: Ship | EnemyShip;
  type?: "player" | "enemy";
  size?: number;
}) => {
  const color =
    type === "player"
      ? SHIP_TYPES[ship.ship_type as keyof typeof SHIP_TYPES].color
      : "#F87171";

  return (
    <motion.div
      className="absolute rounded-full flex items-center justify-center"
      style={{
        left: `${(ship.position_x / GRID_SIZE) * 100}%`,
        top: `${(ship.position_y / GRID_SIZE) * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        zIndex: 10,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.3, boxShadow: `0 0 20px ${color}` }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full h-full flex items-center justify-center">
              {type === "player" ? (
                <RocketIcon size={size / 2} className="text-white" />
              ) : (
                <TargetIcon size={size / 2} className="text-white" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border border-slate-700 p-2 z-50">
            <div className="text-xs">
              <p className="font-bold">{ship.ship_type}</p>
              <p>
                ID:{" "}
                {type === "player"
                  ? (ship as Ship).ship_id
                  : (ship as EnemyShip).enemy_id}
              </p>
              <p>
                Position: ({ship.position_x}, {ship.position_y})
              </p>
              <p className="flex items-center mt-1">
                <ShieldIcon size={12} className="mr-1" />
                <span>{ship.health}</span>
              </p>
              <p className="flex items-center">
                <ZapIcon size={12} className="mr-1" />
                <span>{ship.attack}</span>
              </p>
              {type === "player" && "range" in ship && (
                <>
                  <p className="flex items-center">
                    <ArrowRightIcon size={12} className="mr-1" />
                    <span>Range: {(ship as Ship).range}</span>
                  </p>
                  <p className="flex items-center">
                    <ArrowRightIcon size={12} className="mr-1" />
                    <span>Speed: {(ship as Ship).speed}</span>
                  </p>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

const PlanetComponent = ({ planet, size = 10 }: { planet: Planet; size?: number }) => {
  const planetColors = ["#60A5FA", "#34D399", "#F472B6", "#FBBF24", "#A78BFA"];
  const color = planetColors[planet.planet_id % planetColors.length];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${(planet.position_x / GRID_SIZE) * 100}%`,
        top: `${(planet.position_y / GRID_SIZE) * 100}%`,
        width: `${size * planet.size}px`,
        height: `${size * planet.size}px`,
        backgroundColor: color,
        zIndex: 5,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.1 * planet.planet_id }}
      whileHover={{ scale: 1.2, boxShadow: `0 0 15px ${color}` }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full h-full flex items-center justify-center">
              <GlobeIcon size={(size * planet.size) / 2} className="text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border border-slate-700 p-2 z-50">
            <div className="text-xs">
              <p className="font-bold">Planet {planet.planet_id}</p>
              <p>
                Position: ({planet.position_x}, {planet.position_y})
              </p>
              <p>Size: {planet.size}</p>
              <p>Resource Multiplier: {planet.resource_multiplier}x</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

const AsteroidComponent = ({
  asteroid,
  size = 6,
}: {
  asteroid: Asteroid;
  size?: number;
}) => {
  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{
        left: `${(asteroid.position_x / GRID_SIZE) * 100}%`,
        top: `${(asteroid.position_y / GRID_SIZE) * 100}%`,
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        zIndex: 5,
      }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.05 * asteroid.asteroid_id }}
      whileHover={{ scale: 1.3 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                <div
                  className="absolute rounded-full bg-gray-600"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: "-10px",
                    top: "-5px",
                  }}
                ></div>
                <div
                  className="absolute rounded-full bg-gray-400"
                  style={{
                    width: `${size * 0.8}px`,
                    height: `${size * 0.8}px`,
                    left: "2px",
                    top: "0px",
                  }}
                ></div>
                <div
                  className="absolute rounded-full bg-gray-500"
                  style={{
                    width: `${size * 1.2}px`,
                    height: `${size * 1.2}px`,
                    left: "-3px",
                    top: "3px",
                  }}
                ></div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border border-slate-700 p-2 z-50">
            <div className="text-xs">
              <p className="font-bold">Asteroid Field {asteroid.asteroid_id}</p>
              <p>
                Position: ({asteroid.position_x}, {asteroid.position_y})
              </p>
              <p>Resource Value: {asteroid.resource_value} credits</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};

const StarComponent = ({ star }: { star: Star }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        left: `${star.position_x}%`,
        top: `${star.position_y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        opacity: star.brightness,
      }}
      animate={{
        opacity: [star.brightness, star.brightness * 1.5, star.brightness],
        boxShadow: [
          "0 0 2px rgba(255,255,255,0.5)",
          "0 0 4px rgba(255,255,255,0.8)",
          "0 0 2px rgba(255,255,255,0.5)",
        ],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    />
  );
};

// -----------------------------------------------------------------------
// 7. Main Page Component
// -----------------------------------------------------------------------
const SchemaversePage = () => {
  const [gameState, setGameState] = useState<GameState>(() => generateInitialGameState());
  const [activeTab, setActiveTab] = useState("game");
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState("schema");

  interface GameHistoryItem {
    date: string;
    score: number;
    turns: number;
    shipsDestroyed: number;
  }

  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Safely read high score from localStorage (client-side only)
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem("schemaverseHighScore");
      return savedScore ? parseInt(savedScore) : 0;
    }
    return 0;
  });

  const sqlEditorRef = useRef<HTMLTextAreaElement>(null);

  // Focus the editor whenever you pick a challenge
  useEffect(() => {
    if (activeChallengeId && sqlEditorRef.current) {
      sqlEditorRef.current.focus();
    }
  }, [activeChallengeId]);

  // Check for game over
  useEffect(() => {
    if (gameState.playerShips.length === 0 && gameState.turnsCompleted > 0) {
      setIsGamePaused(true);
      toast.error(`Game Over! Your fleet has been destroyed. Final score: ${gameState.score}`, {
        duration: 5000,
      });

      // Update high score
      if (gameState.score > highScore) {
        setHighScore(gameState.score);
        if (typeof window !== "undefined") {
          localStorage.setItem("schemaverseHighScore", gameState.score.toString());
        }
      }

      // Add to history (keep at most 10)
      setGameHistory((prev) => [
        {
          date: new Date().toLocaleString(),
          score: gameState.score,
          turns: gameState.turnsCompleted,
          shipsDestroyed: gameState.enemyShips.filter((e) => e.health <= 0).length,
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [gameState.playerShips.length]);

  // Execute user query
  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) return;
    const result = executeQuery(sqlQuery, gameState, setGameState, activeChallengeId);
    setQueryResult(result);

    if (result.success) {
      toast.success(result.message, {
        description: "Query Executed",
        duration: 3000,
      });
      if (result.isChallengeSolved) {
        toast.success(
          `You earned ${
            SQL_CHALLENGES.find((c) => c.id === activeChallengeId)?.points || 0
          } points.`,
          {
            description: "Challenge Completed!",
            duration: 3000,
          }
        );
      }
    } else {
      toast.error(result.message, {
        description: "Query Error",
        duration: 3000,
      });
    }
  };

  // Simple highlighting for the code samples in the Help tab
  const highlightSql = (sql: string) => {
    const keywords = [
      "SELECT",
      "UPDATE",
      "INSERT",
      "INTO",
      "DELETE",
      "FROM",
      "WHERE",
      "SET",
      "JOIN",
      "ON",
      "GROUP BY",
      "ORDER BY",
      "VALUES",
    ];
    let highlighted = sql;

    keywords.forEach((keyword) => {
      highlighted = highlighted.replace(
        new RegExp(keyword, "gi"),
        (match) => `<span class="text-blue-400">${match}</span>`
      );
    });

    // Highlight table names
    const tables = ["my_ships", "enemy_ships", "planets", "asteroids", "my_resources"];
    tables.forEach((table) => {
      highlighted = highlighted.replace(
        new RegExp(table, "gi"),
        (match) => `<span class="text-green-400">${match}</span>`
      );
    });

    // Highlight strings
    highlighted = highlighted.replace(
      /'([^']*)'/g,
      (_m, p1) => `<span class="text-amber-300">'${p1}'</span>`
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      (_m, p1) => `<span class="text-purple-400">${p1}</span>`
    );

    return highlighted;
  };

  // Reset the entire game
  const handleResetGame = () => {
    setGameState(generateInitialGameState());
    setSqlQuery("");
    setQueryResult(null);
    setActiveTab("game");
    setActiveChallengeId(null);
    setIsGamePaused(false);
    setTutorialStep(0);
    setShowTutorial(true);

    toast.info("A new game of Schemaverse has begun!", {
      description: "Game Reset",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="border-b border-slate-800 py-4 mb-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              🚀
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600">
              Schemaverse
            </h1>
          </div>

          <div className="flex space-x-2 md:space-x-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Back to SQL.xyz
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-800 hover:bg-blue-900/20"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircleIcon className="w-4 h-4 mr-1" />
              Help
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-amber-400 border-amber-800 hover:bg-amber-900/20"
              onClick={handleResetGame}
            >
              <RefreshCwIcon className="w-4 h-4 mr-1" />
              New Game
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Left: Controls, Challenges, SQL Editor */}
          <div className="md:w-1/3 space-y-6">
            {/* Game Control Panel */}
            <Card className="bg-slate-900 border-slate-800">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center">
                  <CpuIcon className="w-5 h-5 mr-2 text-blue-400" />
                  <h2 className="text-lg font-semibold">Game Controls</h2>
                </div>

                <Button
                  variant={isGamePaused ? "default" : "outline"}
                  size="sm"
                  className={
                    isGamePaused
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "text-amber-400 border-amber-800"
                  }
                  onClick={() => setIsGamePaused(!isGamePaused)}
                >
                  {isGamePaused ? "Resume Game" : "Pause Game"}
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <TrophyIcon className="w-4 h-4 mr-2 text-amber-400" />
                    <span>Score:</span>
                  </div>
                  <span className="font-bold text-amber-400">{gameState.score}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <GlobeIcon className="w-4 h-4 mr-2 text-blue-400" />
                    <span>Turns:</span>
                  </div>
                  <span className="font-bold">{gameState.turnsCompleted}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DatabaseIcon className="w-4 h-4 mr-2 text-green-400" />
                    <span>Credits:</span>
                  </div>
                  <span className="font-bold text-green-400">
                    {gameState.resources.credits}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <RocketIcon className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Ships:</span>
                  </div>
                  <span className="font-bold">{gameState.playerShips.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <TargetIcon className="w-4 h-4 mr-2 text-red-400" />
                    <span>Enemies:</span>
                  </div>
                  <span className="font-bold">
                    {gameState.enemyShips.filter((e) => e.health > 0).length} /{" "}
                    {gameState.enemyShips.length}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center mb-1">
                    <TrophyIcon className="w-4 h-4 mr-2 text-amber-400" />
                    <span className="text-sm">High Score: {highScore}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Earn points by completing challenges, destroying enemies, and
                    collecting resources.
                  </div>
                </div>
              </div>
            </Card>

            {/* SQL Challenges */}
            <Card className="bg-slate-900 border-slate-800">
              <div className="p-4 border-b border-slate-800 flex items-center">
                <CodeIcon className="w-5 h-5 mr-2 text-blue-400" />
                <h2 className="text-lg font-semibold">SQL Challenges</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {SQL_CHALLENGES.map((challenge) => {
                    const isCompleted = gameState.challengesCompleted[challenge.id];
                    const isActive = challenge.id === activeChallengeId;

                    return (
                      <div
                        key={challenge.id}
                        className={`p-3 rounded-md border transition-colors cursor-pointer ${
                          isActive
                            ? "bg-blue-900/30 border-blue-500"
                            : isCompleted
                            ? "bg-green-900/20 border-green-500/30"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                        }`}
                        onClick={() => setActiveChallengeId(challenge.id)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{challenge.title}</h3>
                          <div className="flex items-center space-x-2">
                            {isCompleted && (
                              <Badge className="bg-green-600">
                                <CheckIcon className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                            <Badge className="bg-amber-600">{challenge.points} pts</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {challenge.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* SQL Editor */}
            <Card className="bg-slate-900 border-slate-800">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center">
                  <DatabaseIcon className="w-5 h-5 mr-2 text-blue-400" />
                  <h2 className="text-lg font-semibold">SQL Terminal</h2>
                </div>

                {activeChallengeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:bg-blue-900/20"
                    onClick={() => {
                      const challenge = SQL_CHALLENGES.find((c) => c.id === activeChallengeId);
                      if (challenge) {
                        toast.info(challenge.hint, {
                          description: "Hint",
                          duration: 5000,
                        });
                      }
                    }}
                  >
                    <HelpCircleIcon className="w-4 h-4 mr-1" />
                    Hint
                  </Button>
                )}
              </div>

              <div className="p-4 space-y-3">
                {activeChallengeId && (
                  <div className="bg-slate-800 rounded-md p-3 mb-3 border border-slate-700">
                    <p className="text-sm text-gray-300 mb-2">
                      <span className="font-semibold text-blue-400">
                        {SQL_CHALLENGES.find((c) => c.id === activeChallengeId)?.title}:
                      </span>{" "}
                      {SQL_CHALLENGES.find((c) => c.id === activeChallengeId)?.description}
                    </p>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    ref={sqlEditorRef}
                    className="w-full h-32 bg-slate-800 text-gray-100 p-3 rounded-md font-mono text-sm resize-none border border-slate-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Write your SQL query here..."
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        e.preventDefault();
                        handleExecuteQuery();
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                    Press Ctrl+Enter to execute
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                  onClick={handleExecuteQuery}
                >
                  <SendIcon className="w-4 h-4 mr-2" />
                  Execute Query
                </Button>

                {/* Query Result */}
                {queryResult && (
                  <div
                    className={`mt-4 p-3 rounded-md border ${
                      queryResult.success
                        ? "bg-green-900/20 border-green-500/30"
                        : "bg-red-900/20 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center">
                      {queryResult.success ? (
                        <CheckIcon className="w-4 h-4 text-green-400 mr-2" />
                      ) : (
                        <XIcon className="w-4 h-4 text-red-400 mr-2" />
                      )}
                      <p className="text-sm">{queryResult.message}</p>
                    </div>

                    {queryResult.data && Array.isArray(queryResult.data) && queryResult.data.length > 0 && (
                      <div className="mt-3 bg-slate-800 rounded-md p-2 overflow-auto max-h-40">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-700">
                              {Object.keys(queryResult.data[0]).map((key) => (
                                <th key={key} className="px-2 py-1 text-left text-gray-400">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.data.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-slate-700/50">
                                {Object.values(row).map((value, j) => (
                                  <td key={j} className="px-2 py-1">
                                    {value !== null && value !== undefined ? value.toString() : "NULL"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Game View */}
          <div className="md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="bg-slate-800">
                  <TabsTrigger value="game" className="data-[state=active]:bg-blue-700">
                    <LayoutGridIcon className="w-4 h-4 mr-2" />
                    Game View
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-blue-700">
                    <DatabaseIcon className="w-4 h-4 mr-2" />
                    Database
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-blue-700">
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-600 py-1">
                    <RocketIcon className="w-3 h-3 mr-1" />
                    Ships: {gameState.playerShips.length}
                  </Badge>
                  <Badge className="bg-amber-600 py-1">
                    <DatabaseIcon className="w-3 h-3 mr-1" />
                    Credits: {gameState.resources.credits}
                  </Badge>
                </div>
              </div>

              <TabsContent value="game" className="mt-0">
                <Card className="bg-slate-900 border-slate-700 overflow-hidden">
                  <div className="relative w-full bg-slate-950" style={{ paddingTop: "100%" }}>
                    {/* Stars */}
                    <div className="absolute inset-0">
                      {gameState.stars.map((star) => (
                        <StarComponent key={star.id} star={star} />
                      ))}
                    </div>

                    {/* Grid Lines (for visual reference) */}
                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
                      {[...Array(10)].map((_, i) => (
                        <React.Fragment key={i}>
                          <div className="col-span-1 border-r border-slate-800/30 h-full" />
                        </React.Fragment>
                      ))}
                      {[...Array(10)].map((_, i) => (
                        <React.Fragment key={i}>
                          <div className="row-span-1 border-b border-slate-800/30 w-full col-span-10" />
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Game Objects */}
                    <div className="absolute inset-0">
                      {/* Planets */}
                      {gameState.planets.map((planet) => (
                        <PlanetComponent
                          key={`planet-${planet.planet_id}`}
                          planet={planet}
                          size={16}
                        />
                      ))}

                      {/* Asteroids */}
                      {gameState.asteroids.map((asteroid) => (
                        <AsteroidComponent
                          key={`asteroid-${asteroid.asteroid_id}`}
                          asteroid={asteroid}
                        />
                      ))}

                      {/* Enemy Ships */}
                      {gameState.enemyShips
                        .filter((ship) => ship.health > 0)
                        .map((ship) => (
                          <ShipComponent
                            key={`enemy-${ship.enemy_id}`}
                            ship={ship}
                            type="enemy"
                            size={12}
                          />
                        ))}

                      {/* Player Ships */}
                      {gameState.playerShips.map((ship) => (
                        <ShipComponent key={`ship-${ship.ship_id}`} ship={ship} size={14} />
                      ))}
                    </div>

                    {/* Coordinates Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* X coords */}
                      <div className="absolute top-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-500">
                        {[...Array(GRID_SIZE + 1).keys()]
                          .filter((i) => i % 2 === 0)
                          .map((x) => (
                            <div
                              key={`x-${x}`}
                              style={{ left: `${(x / GRID_SIZE) * 100}%` }}
                              className="absolute transform -translate-x-1/2"
                            >
                              {x}
                            </div>
                          ))}
                      </div>
                      {/* Y coords */}
                      <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-2 text-xs text-gray-500">
                        {[...Array(GRID_SIZE + 1).keys()]
                          .filter((i) => i % 2 === 0)
                          .map((y) => (
                            <div
                              key={`y-${y}`}
                              style={{ top: `${(y / GRID_SIZE) * 100}%` }}
                              className="absolute transform -translate-y-1/2"
                            >
                              {y}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Pause / GameOver Overlay */}
                    {isGamePaused && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                          <Button
                            onClick={() => setIsGamePaused(false)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Resume Game
                          </Button>

                          {gameState.playerShips.length === 0 && (
                            <div className="mt-6">
                              <h3 className="text-xl font-bold text-amber-400 mb-2">
                                Game Over!
                              </h3>
                              <p className="mb-4">Your fleet has been destroyed.</p>
                              <Button
                                onClick={handleResetGame}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                <RefreshCwIcon className="w-4 h-4 mr-2" />
                                Start New Game
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="mt-0">
                <Card className="bg-slate-900 border-slate-700">
                  <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold">Game Database</h2>
                    <p className="text-sm text-gray-400">
                      View and analyze the current game state
                    </p>
                  </div>

                  <div className="p-4">
                    <Tabs defaultValue="my_ships">
                      <TabsList className="bg-slate-800 mb-4">
                        <TabsTrigger
                          value="my_ships"
                          className="data-[state=active]:bg-blue-700"
                        >
                          My Fleet
                        </TabsTrigger>
                        <TabsTrigger
                          value="enemy_ships"
                          className="data-[state=active]:bg-blue-700"
                        >
                          Enemy Ships
                        </TabsTrigger>
                        <TabsTrigger
                          value="planets"
                          className="data-[state=active]:bg-blue-700"
                        >
                          Planets
                        </TabsTrigger>
                        <TabsTrigger
                          value="asteroids"
                          className="data-[state=active]:bg-blue-700"
                        >
                          Asteroids
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="my_ships">
                        <div className="bg-slate-800 rounded-md p-3 overflow-auto max-h-72">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="px-3 py-2 text-left">ID</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Position</th>
                                <th className="px-3 py-2 text-left">Health</th>
                                <th className="px-3 py-2 text-left">Attack</th>
                                <th className="px-3 py-2 text-left">Range</th>
                                <th className="px-3 py-2 text-left">Speed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gameState.playerShips.map((ship) => (
                                <tr
                                  key={ship.ship_id}
                                  className="border-b border-slate-700/30"
                                >
                                  <td className="px-3 py-2">{ship.ship_id}</td>
                                  <td className="px-3 py-2">{ship.ship_type}</td>
                                  <td className="px-3 py-2">
                                    ({ship.position_x}, {ship.position_y})
                                  </td>
                                  <td className="px-3 py-2">{ship.health}</td>
                                  <td className="px-3 py-2">{ship.attack}</td>
                                  <td className="px-3 py-2">{ship.range}</td>
                                  <td className="px-3 py-2">{ship.speed}</td>
                                </tr>
                              ))}
                              {gameState.playerShips.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-3 py-4 text-center text-gray-400"
                                  >
                                    No ships in your fleet
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>

                      <TabsContent value="enemy_ships">
                        <div className="bg-slate-800 rounded-md p-3 overflow-auto max-h-72">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="px-3 py-2 text-left">ID</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Position</th>
                                <th className="px-3 py-2 text-left">Health</th>
                                <th className="px-3 py-2 text-left">Attack</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gameState.enemyShips.map((ship) => (
                                <tr
                                  key={ship.enemy_id}
                                  className={`border-b border-slate-700/30 ${
                                    ship.health <= 0 ? "text-gray-500" : ""
                                  }`}
                                >
                                  <td className="px-3 py-2">{ship.enemy_id}</td>
                                  <td className="px-3 py-2">{ship.ship_type}</td>
                                  <td className="px-3 py-2">
                                    ({ship.position_x}, {ship.position_y})
                                  </td>
                                  <td className="px-3 py-2">
                                    {ship.health <= 0 ? (
                                      <span className="text-red-500">DESTROYED</span>
                                    ) : (
                                      ship.health
                                    )}
                                  </td>
                                  <td className="px-3 py-2">{ship.attack}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>

                      <TabsContent value="planets">
                        <div className="bg-slate-800 rounded-md p-3 overflow-auto max-h-72">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="px-3 py-2 text-left">ID</th>
                                <th className="px-3 py-2 text-left">Position</th>
                                <th className="px-3 py-2 text-left">Size</th>
                                <th className="px-3 py-2 text-left">Resource Multiplier</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gameState.planets.map((planet) => (
                                <tr
                                  key={planet.planet_id}
                                  className="border-b border-slate-700/30"
                                >
                                  <td className="px-3 py-2">{planet.planet_id}</td>
                                  <td className="px-3 py-2">
                                    ({planet.position_x}, {planet.position_y})
                                  </td>
                                  <td className="px-3 py-2">{planet.size}</td>
                                  <td className="px-3 py-2">
                                    {planet.resource_multiplier}x
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>

                      <TabsContent value="asteroids">
                        <div className="bg-slate-800 rounded-md p-3 overflow-auto max-h-72">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="px-3 py-2 text-left">ID</th>
                                <th className="px-3 py-2 text-left">Position</th>
                                <th className="px-3 py-2 text-left">Resource Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gameState.asteroids.map((asteroid) => (
                                <tr
                                  key={asteroid.asteroid_id}
                                  className="border-b border-slate-700/30"
                                >
                                  <td className="px-3 py-2">{asteroid.asteroid_id}</td>
                                  <td className="px-3 py-2">
                                    ({asteroid.position_x}, {asteroid.position_y})
                                  </td>
                                  <td className="px-3 py-2">
                                    {asteroid.resource_value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Resources</h3>
                      <div className="bg-slate-800 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400">Credits</span>
                            <span className="font-bold text-green-400">
                              {gameState.resources.credits}
                            </span>
                          </div>
                          <Progress
                              value={(gameState.resources.credits / 5000) * 100}
                              className="h-2 bg-slate-700"
                              color="bg-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400">Fuel</span>
                            <span className="font-bold text-blue-400">
                              {gameState.resources.fuel}
                            </span>
                          </div>
                          <Progress
                              value={(gameState.resources.fuel / 200) * 100}
                              className="h-2 bg-slate-700"
                              color="bg-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400">Materials</span>
                            <span className="font-bold text-purple-400">
                              {gameState.resources.materials}
                            </span>
                          </div>
                          <Progress
                              value={(gameState.resources.materials / 500) * 100}
                              className="h-2 bg-slate-700"
                              color="bg-purple-500"
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="mt-0">
                <Card className="bg-slate-900 border-slate-700">
                  <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold">Game History</h2>
                    <p className="text-sm text-gray-400">
                      Your previous games and achievements
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="mb-6">
                      <h3 className="text-md font-semibold mb-3 flex items-center">
                        <TrophyIcon className="w-4 h-4 mr-2 text-amber-400" />
                        High Score: {highScore}
                      </h3>

                      <div className="bg-slate-800 rounded-md p-4">
                        <h4 className="font-semibold mb-3">Challenge Progress</h4>
                        <div className="space-y-2">
                          {SQL_CHALLENGES.map((challenge) => {
                            const isCompleted = gameState.challengesCompleted[challenge.id];
                            return (
                              <div key={challenge.id} className="flex items-center">
                                {isCompleted ? (
                                  <CheckIcon className="w-4 h-4 text-green-400 mr-2" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-gray-600 mr-2"></div>
                                )}
                                <span
                                  className={
                                    isCompleted ? "text-green-300" : "text-gray-400"
                                  }
                                >
                                  {challenge.title}
                                </span>
                                <Badge className="ml-2 bg-amber-600/50">
                                  {challenge.points} pts
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-md font-semibold mb-3">Recent Games</h3>
                    {gameHistory.length > 0 ? (
                      <div className="bg-slate-800 rounded-md p-3 overflow-auto max-h-72">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="px-3 py-2 text-left">Date</th>
                              <th className="px-3 py-2 text-left">Score</th>
                              <th className="px-3 py-2 text-left">Turns</th>
                              <th className="px-3 py-2 text-left">Ships Destroyed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gameHistory.map((game, index) => (
                              <tr key={index} className="border-b border-slate-700/30">
                                <td className="px-3 py-2">{game.date}</td>
                                <td className="px-3 py-2 font-bold text-amber-400">
                                  {game.score}
                                </td>
                                <td className="px-3 py-2">{game.turns}</td>
                                <td className="px-3 py-2">{game.shipsDestroyed}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-slate-800 rounded-md p-6 text-center text-gray-400">
                        <p>No game history yet. Complete a game to see your stats!</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-blue-500 rounded-lg max-w-xl w-full p-6 mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-400">
                  {TUTORIAL_STEPS[tutorialStep].title}
                </h2>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-300"
                  onClick={() => setShowTutorial(false)}
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300">{TUTORIAL_STEPS[tutorialStep].content}</p>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-blue-700 text-blue-400"
                  onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                  disabled={tutorialStep === 0}
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowTutorial(false)}
                  >
                    Start Playing
                    <RocketIcon className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  {TUTORIAL_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === tutorialStep ? "bg-blue-500" : "bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              className="bg-slate-900 border border-blue-500 rounded-lg max-w-4xl w-full p-6 mx-4 max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-400">Schemaverse Help</h2>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-300"
                  onClick={() => setShowHelp(false)}
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>

              <Tabs defaultValue={helpTab} onValueChange={setHelpTab}>
                <TabsList className="bg-slate-800 mb-4">
                  <TabsTrigger value="schema" className="data-[state=active]:bg-blue-700">
                    <DatabaseIcon className="w-4 h-4 mr-1" />
                    Database Schema
                  </TabsTrigger>
                  <TabsTrigger value="commands" className="data-[state=active]:bg-blue-700">
                    <CodeIcon className="w-4 h-4 mr-1" />
                    SQL Commands
                  </TabsTrigger>
                  <TabsTrigger value="gameplay" className="data-[state=active]:bg-blue-700">
                    <GamepadIcon className="w-4 h-4 mr-1" />
                    Gameplay
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="schema">
                  <div className="space-y-6">
                    <p className="text-gray-300 mb-4">
                      The Schemaverse game is built on a relational database structure. Here
                      are the tables and their columns that you can query and manipulate:
                    </p>

                    {GAME_SCHEMA.map((table) => (
                      <div key={table.table} className="bg-slate-800 rounded-md p-4">
                        <h3 className="text-lg font-semibold text-blue-400 mb-2">
                          {table.table}
                        </h3>
                        <p className="text-gray-400 mb-3">{table.description}</p>

                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="px-3 py-2 text-left">Column</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((column) => (
                                <tr
                                  key={column.name}
                                  className="border-b border-slate-700/30"
                                >
                                  <td className="px-3 py-2 font-mono text-green-400">
                                    {column.name}
                                  </td>
                                  <td className="px-3 py-2 text-purple-400">{column.type}</td>
                                  <td className="px-3 py-2 text-gray-300">
                                    {column.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="commands">
                  <div className="space-y-6">
                    <p className="text-gray-300 mb-4">
                      In Schemaverse, you control your fleet using SQL commands. Here are
                      the main SQL commands you'll need:
                    </p>

                    {SQL_COMMANDS.map((cmd) => (
                      <div key={cmd.command} className="bg-slate-800 rounded-md p-4">
                        <h3 className="text-lg font-semibold text-blue-400 mb-2">
                          {cmd.command}
                        </h3>
                        <p className="text-gray-400 mb-3">{cmd.description}</p>

                        <div className="bg-slate-900 rounded p-3 font-mono text-sm">
                          <div
                            dangerouslySetInnerHTML={{ __html: highlightSql(cmd.example) }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="bg-slate-800 rounded-md p-4">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">
                        Common Game Actions
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-300 mb-1">Moving Ships</h4>
                          <div className="bg-slate-900 rounded p-3 font-mono text-sm mb-2">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: highlightSql(
                                  "UPDATE my_ships SET position_x = 10, position_y = 15 WHERE ship_id = 1;"
                                ),
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-400">
                            Move your ship to new coordinates on the grid.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-300 mb-1">
                            Attacking Enemy Ships
                          </h4>
                          <div className="bg-slate-900 rounded p-3 font-mono text-sm mb-2">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: highlightSql(
                                  "UPDATE enemy_ships SET health = health - (SELECT attack FROM my_ships WHERE ship_id = 1) WHERE enemy_id = 3;"
                                ),
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-400">
                            Deal damage to an enemy ship using your ship's attack power.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-300 mb-1">
                            Purchasing New Ships
                          </h4>
                          <div className="bg-slate-900 rounded p-3 font-mono text-sm mb-2">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: highlightSql(
                                  "INSERT INTO my_ships (ship_type, position_x, position_y) VALUES ('SCOUT', 5, 5);"
                                ),
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-400">
                            Add a new ship to your fleet using your available resources.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-300 mb-1">
                            Collecting Resources
                          </h4>
                          <div className="bg-slate-900 rounded p-3 font-mono text-sm mb-2">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: highlightSql(
                                  "UPDATE my_resources SET credits = credits + (SELECT resource_value FROM asteroids WHERE asteroid_id = 2);"
                                ),
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-400">
                            Collect resources from asteroids to fuel your fleet expansion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="gameplay">
                  <div className="space-y-6">
                    <p className="text-gray-300 mb-4">
                      Schemaverse is a space strategy game where you command a fleet of
                      ships using SQL queries. Here's how to play:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800 rounded-md p-4">
                        <h3 className="text-lg font-semibold text-blue-400 flex items-center mb-3">
                          <RocketIcon className="w-5 h-5 mr-2" />
                          Ship Types
                        </h3>

                        <div className="space-y-3">
                          <div className="p-3 bg-slate-900 rounded-md border border-blue-900/50">
                            <h4 className="font-semibold text-blue-400 mb-1">Scout</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Cost:</span> 500
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Health:</span> 30
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Attack:</span> 10
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Speed:</span> 3
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Range:</span> 3
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-md border border-green-900/50">
                            <h4 className="font-semibold text-green-400 mb-1">Destroyer</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Cost:</span> 1200
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Health:</span> 80
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Attack:</span> 25
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Speed:</span> 2
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Range:</span> 4
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-md border border-pink-900/50">
                            <h4 className="font-semibold text-pink-400 mb-1">Battleship</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Cost:</span> 3000
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Health:</span> 200
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Attack:</span> 50
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Speed:</span> 1
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">Range:</span> 5
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-md p-4">
                        <h3 className="text-lg font-semibold text-blue-400 flex items-center mb-3">
                          <TrophyIcon className="w-5 h-5 mr-2" />
                          Scoring & Objectives
                        </h3>

                        <div className="space-y-3 text-sm">
                          <p className="text-gray-300">
                            The goal of Schemaverse is to earn the highest possible score by
                            completing challenges, destroying enemy ships, and collecting
                            resources.
                          </p>

                          <h4 className="font-semibold text-amber-400 mt-4 mb-1">
                            Ways to Earn Points:
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-300">
                            <li>Complete SQL challenges (100-400 points each)</li>
                            <li>Destroy enemy ships (100 points per ship)</li>
                            <li>Deal damage to enemies (1 point per damage point)</li>
                            <li>Collect resources (1 point per 10 credits)</li>
                            <li>Purchase new ships (50 points per ship)</li>
                            <li>Control planets (bonus resources)</li>
                          </ul>

                          <h4 className="font-semibold text-red-400 mt-4 mb-1">
                            Game Over Conditions:
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-300">
                            <li>All your ships are destroyed</li>
                          </ul>

                          <div className="mt-4 p-3 bg-slate-900 rounded-md border border-amber-900/50">
                            <h4 className="font-semibold text-amber-400 mb-1">Pro Tip</h4>
                            <p className="text-gray-300">
                              Focus on completing challenges early to earn credits for
                              building a larger fleet. Position your ships strategically near
                              asteroids to automatically collect resources each turn.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-md p-4">
                      <h3 className="text-lg font-semibold text-blue-400 flex items-center mb-3">
                        <InfoIcon className="w-5 h-5 mr-2" />
                        Game Elements
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-slate-900 rounded-md">
                          <h4 className="font-semibold text-blue-400 flex items-center mb-2">
                            <RocketIcon className="w-4 h-4 mr-1" />
                            Ships
                          </h4>
                          <p className="text-gray-300">
                            Your fleet of vessels that you control using SQL queries. Each
                            ship has unique stats and abilities.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-md">
                          <h4 className="font-semibold text-red-400 flex items-center mb-2">
                            <TargetIcon className="w-4 h-4 mr-1" />
                            Enemies
                          </h4>
                          <p className="text-gray-300">
                            Hostile ships that will attack your fleet if they get too close.
                            Destroy them to earn points.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-md">
                          <h4 className="font-semibold text-purple-400 flex items-center mb-2">
                            <GlobeIcon className="w-4 h-4 mr-1" />
                            Planets
                          </h4>
                          <p className="text-gray-300">
                            Celestial bodies that provide resource bonuses when your ships
                            are nearby.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-md">
                          <h4 className="font-semibold text-gray-400 flex items-center mb-2">
                            <DatabaseIcon className="w-4 h-4 mr-1" />
                            Asteroids
                          </h4>
                          <p className="text-gray-300">
                            Resource-rich fields that can be mined for credits when your
                            ships are adjacent to them.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowHelp(false)} className="bg-blue-600 hover:bg-blue-700">
                  Got it!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchemaversePage;