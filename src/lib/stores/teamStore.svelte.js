/**
 * Team Store - Manages team state using Svelte 5 Runes
 */
import { saveTeam, loadTeam } from '../utils/storage.js';
import { Team } from '../models/Team.js';
import { Player } from '../models/Player.js';
import { generateId } from '../utils/idGenerator.js';
import { getSportById } from '../config/sports.js';

// Create reactive state using $state rune
let team = $state(null);
let sport = $state(null);
let teamSize = $state(11);
let formation = $state(null);

// Add $effect to auto-save when team changes
$effect(() => {
  if (team) {
    saveTeam(team);
  }
});

export function restoreTeam() {
  const savedData = loadTeam();
  if (savedData) {
    team = Team.fromJSON(savedData);
    sport = getSportById(team.sportId);
    teamSize = team.teamSize;
    formation = team.activeFormation;
    return true;
  }
  return false;
}

/**
 * Initialize or reset team
 */
export function initializeTeam(selectedSport, size = 11) {
  sport = selectedSport;
  teamSize = size;
  formation = selectedSport.getFormationsForTeamSize(size)[0];

  team = new Team({
    id: generateId(),
    name: 'My Team',
    sportId: selectedSport.id,
    teamSize: size,
    players: [],
    activeFormation: formation
  });
}

/**
 * Set sport
 */
export function setSport(selectedSport) {
  sport = selectedSport;
  const defaultSize = selectedSport.maxPlayers;
  teamSize = defaultSize;
  formation = selectedSport.getFormationsForTeamSize(defaultSize)[0];
}

/**
 * Set team size
 */
export function setTeamSize(size) {
  teamSize = size;
  if (sport) {
    const formations = sport.getFormationsForTeamSize(size);
    formation = formations[0] || null;
  }
}

/**
 * Set formation
 */
export function setFormation(newFormation) {
  formation = newFormation;
  if (team) {
    team.activeFormation = newFormation;
  }
}

/**
 * Add player to team
 */
export function addPlayer(playerData) {
  if (!team) return;

  const player = new Player({
    ...playerData,
    id: generateId()
  });

  team.addPlayer(player);
}

/**
 * Update player
 */
export function updatePlayer(playerId, updates) {
  if (!team) return;
  team.updatePlayer(playerId, updates);
}

/**
 * Delete player
 */
export function deletePlayer(playerId) {
  if (!team) return;
  team.removePlayer(playerId);
}

/**
 * Assign player to position
 */
export function assignPlayerToPosition(playerId, positionName) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.assignToPosition(positionName);
  }
}

/**
 * Move player to bench
 */
export function movePlayerToBench(playerId) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.moveToBench();
  }
}

/**
 * Substitute players
 */
export function substitutePlayers(onFieldPlayerId, benchPlayerId) {
  if (!team) return;

  const onFieldPlayer = team.getPlayer(onFieldPlayerId);
  const benchPlayer = team.getPlayer(benchPlayerId);

  if (onFieldPlayer && benchPlayer) {
    const position = onFieldPlayer.position;
    onFieldPlayer.moveToBench();
    benchPlayer.assignToPosition(position);
  }
}

/**
 * Get current team state (reactive)
 */
export function getTeam() {
  return team;
}

/**
 * Get current sport (reactive)
 */
export function getSport() {
  return sport;
}

/**
 * Get current team size (reactive)
 */
export function getTeamSize() {
  return teamSize;
}

/**
 * Get current formation (reactive)
 */
export function getFormation() {
  return formation;
}

/**
 * Get all players (reactive)
 */
export function getPlayers() {
  return team?.players || [];
}

/**
 * Get field players (reactive)
 */
export function getFieldPlayers() {
  return team?.getFieldPlayers() || [];
}

/**
 * Get bench players (reactive)
 */
export function getBenchPlayers() {
  return team?.getBenchPlayers() || [];
}

/**
 * Get formation status (reactive)
 */
export function getFormationStatus() {
  return team && formation ? team.getFormationStatus(formation) : {};
}
