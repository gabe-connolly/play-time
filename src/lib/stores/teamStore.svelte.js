/**
 * Team Store - Manages team state using Svelte 5 Runes
 */
import { saveTeam, loadTeam, clearAllData } from '../utils/storage.js';
import { Team } from '$lib/models/Team.js';
import { Player } from '$lib/models/Player.js';
import { generateId } from '$lib/utils/idGenerator.js';
import { getSportById } from '$lib/config/sports.js';
import { getClockRunning } from '$lib/stores/gameStore.svelte.js';

// Create reactive state using $state rune
let team = $state(null);
let sport = $state(null);
let teamSize = $state(11);
let formation = $state(null);

function persist() {
  if (team) {
    saveTeam(team);
  }
}

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
  persist();
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
  persist();
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
  persist();
}

/**
 * Set formation
 */
export function setFormation(newFormation) {
  formation = newFormation;
  if (team) {
    team.activeFormation = newFormation;
  }
  persist();
}

/**
 * Set team name
 */
export function setTeamName(name) {
  if (team) {
    team.name = name;
    team = Team.fromJSON(team.toJSON());
    persist();
  }
}

/**
 * Set team description
 */
export function setTeamDescription(description) {
  if (team) {
    team.description = description;
    team = Team.fromJSON(team.toJSON());
    persist();
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
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Update player
 */
export function updatePlayer(playerId, updates) {
  if (!team) return;
  team.updatePlayer(playerId, updates);
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Delete player
 */
export function deletePlayer(playerId) {
  if (!team) return;
  team.removePlayer(playerId);
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Assign player to position
 */
export function assignPlayerToPosition(playerId, positionName, slotIndex = null) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.assignToPosition(positionName, slotIndex);
    if (getClockRunning() && player.fieldEntryTime === null) {
      player.fieldEntryTime = Date.now();
    }
    team = Team.fromJSON(team.toJSON());
    persist();
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
    team = Team.fromJSON(team.toJSON());
    persist();
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
    if (getClockRunning() && benchPlayer.fieldEntryTime === null) {
      benchPlayer.fieldEntryTime = Date.now();
    }
    team = Team.fromJSON(team.toJSON());
    persist();
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
    const tempPosition = player1.position;
    const tempSlotIndex = player1.positionIndex;

    player1.assignToPosition(player2.position, player2.positionIndex);
    player2.assignToPosition(tempPosition, tempSlotIndex);

    team = Team.fromJSON(team.toJSON());
    persist();
  }
}

/**
 * Commit substitution: apply pending lineup as active, clear pending
 */
export function commitSubstitution() {
  if (!team) return;

  const clockOn = getClockRunning();
  const now = Date.now();
  team.players.forEach(player => {
    player.applyPendingPosition();
    if (clockOn && player.isOnField() && player.fieldEntryTime === null) {
      player.fieldEntryTime = now;
    }
  });
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Start the game clock — set fieldEntryTime for all on-field players
 */
export function startClock() {
  if (!team) return;
  const now = Date.now();
  team.players.forEach(player => {
    if (player.isOnField() && player.fieldEntryTime === null) {
      player.fieldEntryTime = now;
    }
  });
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Stop the game clock — accumulate time for all on-field players
 */
export function stopClock() {
  if (!team) return;
  const now = Date.now();
  team.players.forEach(player => {
    if (player.fieldEntryTime !== null) {
      player.playTimeMs += now - player.fieldEntryTime;
      player.fieldEntryTime = null;
    }
  });
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Reset all stored data and state
 */
export function resetAllData() {
  clearAllData();
  team = null;
  sport = null;
  teamSize = 11;
  formation = null;
}

/**
 * Reset play time for all players (for new game)
 */
export function resetPlayTime() {
  if (!team) return;
  team.players.forEach(player => {
    player.resetPlayTime();
  });
  team = Team.fromJSON(team.toJSON());
  persist();
}

// Getters

export function getTeam() {
  return team;
}

export function getSport() {
  return sport;
}

export function getTeamSize() {
  return teamSize;
}

export function getFormation() {
  return formation;
}

export function getPlayers() {
  return team?.players ?? [];
}

export function getFieldPlayers() {
  return team?.getFieldPlayers() || [];
}

export function getBenchPlayers() {
  return team?.getBenchPlayers() || [];
}

export function getFormationStatus(pending = false) {
  return team && formation ? team.getFormationStatus(formation, pending) : {};
}

/**
 * Assign player to pending position
 */
export function assignPlayerToPendingPosition(playerId, positionName, slotIndex = null) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.assignToPendingPosition(positionName, slotIndex);
    team = Team.fromJSON(team.toJSON());
    persist();
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
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Clear all pending positions
 */
export function clearPendingPositions() {
  if (!team) return;

  team.players.forEach(player => {
    player.clearPendingPosition();
  });
  team = Team.fromJSON(team.toJSON());
  persist();
}

/**
 * Clear a single player's pending position
 */
export function clearPlayerPendingPosition(playerId) {
  if (!team) return;

  const player = team.getPlayer(playerId);
  if (player) {
    player.clearPendingPosition();
    team = Team.fromJSON(team.toJSON());
    persist();
  }
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
  team = Team.fromJSON(team.toJSON());
  persist();
}
