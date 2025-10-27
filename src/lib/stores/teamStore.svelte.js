/**
 * Team Store - Manages team state using Svelte 5 Runes
 */
import { saveTeam, loadTeam } from '../utils/storage.js';
import { Team } from '$lib/models/Team.js';
import { Player } from '$lib/models/Player.js';
import { generateId } from '$lib/utils/idGenerator.js';
import { getSportById } from '$lib/config/sports.js';

// Create reactive state using $state rune
let team = $state(null);
let sport = $state(null);
let teamSize = $state(11);
let formation = $state(null);



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
  
  // Initialize team if not already initialized
  if (!team) {
    team = new Team({
      id: generateId(),
      name: 'My Team',
      sportId: selectedSport.id,
      teamSize: defaultSize,
      players: [],
      activeFormation: formation
    });
  }
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
 * Set team name
 */
export function setTeamName(name) {
  if (team) {
    team.name = name;
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
  }
}

/**
 * Set team description
 */
export function setTeamDescription(description) {
  if (team) {
    team.description = description;
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
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
  // Create a new Team instance to trigger reactivity
  team = Team.fromJSON(team.toJSON());
}

/**
 * Update player
 */
export function updatePlayer(playerId, updates) {
  if (!team) return;
  team.updatePlayer(playerId, updates);
  // Create a new Team instance to trigger reactivity
  team = Team.fromJSON(team.toJSON());
}

/**
 * Delete player
 */
export function deletePlayer(playerId) {
  if (!team) return;
  team.removePlayer(playerId);
  // Create a new Team instance to trigger reactivity
  team = Team.fromJSON(team.toJSON());
}

/**
 * Assign player to position
 */
export function assignPlayerToPosition(playerId, positionName, slotIndex = null) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.assignToPosition(positionName, slotIndex);
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
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
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
  }
}

/**
 * Substitute players
 */
export function substitutePlayers(onFieldPlayerId, benchPlayerId, targetSlotIndex = null) {
  if (!team) return;

  const onFieldPlayer = team.getPlayer(onFieldPlayerId);
  const benchPlayer = team.getPlayer(benchPlayerId);

  if (onFieldPlayer && benchPlayer) {
    const position = onFieldPlayer.position;
    const slotIndex = targetSlotIndex !== null ? targetSlotIndex : onFieldPlayer.positionIndex;
    onFieldPlayer.moveToBench();
    benchPlayer.assignToPosition(position, slotIndex);
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
  }
}

/**
 * Swap two players on the field
 */
export function swapFieldPlayers(player1Id, player2Id) {
  if (!team) return;

  const player1 = team.getPlayer(player1Id);
  const player2 = team.getPlayer(player2Id);

  if (player1 && player2 && player1.isOnField() && player2.isOnField()) {
    // Swap positions and slot indices
    const tempPosition = player1.position;
    const tempSlotIndex = player1.positionIndex;
    
    player1.assignToPosition(player2.position, player2.positionIndex);
    player2.assignToPosition(tempPosition, tempSlotIndex);
    
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
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
  return team?.players ?? [];
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

/**
 * Assign player to pending position
 */
export function assignPlayerToPendingPosition(playerId, positionName, slotIndex = null) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.assignToPendingPosition(positionName, slotIndex);
    // Create a new Team instance to trigger reactivity
    team = Team.fromJSON(team.toJSON());
  }
}

/**
 * Apply all pending positions (swap to pending field)
 */
export function applyPendingPositions() {
  if (!team) return;

  team.players.forEach(player => {
    player.applyPendingPosition();
  });
  // Create a new Team instance to trigger reactivity
  team = Team.fromJSON(team.toJSON());
}

/**
 * Clear all pending positions
 */
export function clearPendingPositions() {
  if (!team) return;

  team.players.forEach(player => {
    player.clearPendingPosition();
  });
  // Create a new Team instance to trigger reactivity
  team = Team.fromJSON(team.toJSON());
}

/**
 * Initialize pending positions from active positions
 */
export function initializePendingFromActive() {
  if (!team) return;

  team.players.forEach(player => {
    if (player.isOnField()) {
      player.assignToPendingPosition(player.position, player.positionIndex);
    } else {
      player.clearPendingPosition();
    }
  });
  // Create a new Team instance to trigger reactivity
  team = Team.fromJSON(team.toJSON());
}
