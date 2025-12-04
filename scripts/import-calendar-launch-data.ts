/**
 * Import script for Calendar/Launch data from agentix-marketing export
 * 
 * This script imports data from calendar-launch-export.json into the current Supabase project.
 * It handles foreign key relationships and remaps user/client IDs.
 * 
 * Usage:
 *   npx ts-node scripts/import-calendar-launch-data.ts
 * 
 * Prerequisites:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   - Or use VITE_SUPABASE_URL and provide service key manually
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables:');
  console.error('  SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nSet these in your .env file or export them.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ExportData {
  success: boolean;
  data: {
    chat_sessions: any[];
    chat_messages: any[];
    scheduled_posts: any[];
    agent_boards: any[];
    creative_cards: any[];
    canvas_blocks: any[];
    assets: any[];
    [key: string]: any[];
  };
}

async function getOrCreateDefaultClient(): Promise<string | null> {
  // Try to get the first client
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error fetching clients:', error);
    return null;
  }

  if (clients && clients.length > 0) {
    return clients[0].id;
  }

  console.log('No clients found. Skipping client-related imports.');
  return null;
}

async function getFirstUserId(): Promise<string | null> {
  // Get the first user from auth.users via a workaround (check user_profiles or similar)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);

  if (error || !data || data.length === 0) {
    console.log('No user profiles found.');
    return null;
  }

  return data[0].id;
}

async function importAgentBoards(boards: any[], clientId: string | null): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();
  
  if (!boards || boards.length === 0) {
    console.log('No agent_boards to import');
    return idMap;
  }

  console.log(`\nImporting ${boards.length} agent_boards...`);

  for (const board of boards) {
    const oldId = board.id;
    
    // Check if board already exists (by name to avoid duplicates)
    const { data: existing } = await supabase
      .from('agent_boards')
      .select('id')
      .eq('name', board.name)
      .maybeSingle();

    if (existing) {
      console.log(`  Agent board "${board.name}" already exists, using existing ID`);
      idMap.set(oldId, existing.id);
      continue;
    }

    // Insert new board - only include columns that exist in the schema
    const newBoard = {
      name: board.name,
      description: board.description,
      goal: board.goal,
      default_platform: board.default_platform,
      budget_cap_note: board.budget_cap_note,
      creative_style_notes: board.creative_style_notes,
      facebook_ad_account_id: board.facebook_ad_account_id,
      redtrack_workspace_id: board.redtrack_workspace_id,
      position: board.position,
      group_name: board.group_name,
      // Note: client_id does NOT exist in this schema
    };

    const { data: inserted, error } = await supabase
      .from('agent_boards')
      .insert(newBoard)
      .select('id')
      .single();

    if (error) {
      console.error(`  Error inserting agent_board "${board.name}":`, error.message);
    } else if (inserted) {
      idMap.set(oldId, inserted.id);
      console.log(`  Imported agent_board: ${board.name}`);
    }
  }

  return idMap;
}

async function importCreativeCards(cards: any[], boardIdMap: Map<string, string>): Promise<void> {
  if (!cards || cards.length === 0) {
    console.log('No creative_cards to import');
    return;
  }

  console.log(`\nImporting ${cards.length} creative_cards...`);

  for (const card of cards) {
    const newBoardId = card.agent_board_id ? boardIdMap.get(card.agent_board_id) : null;

    // Check if card already exists
    const { data: existing } = await supabase
      .from('creative_cards')
      .select('id')
      .eq('title', card.title)
      .eq('agent_board_id', newBoardId)
      .maybeSingle();

    if (existing) {
      console.log(`  Creative card "${card.title}" already exists, skipping`);
      continue;
    }

    const newCard = {
      agent_board_id: newBoardId,
      title: card.title,
      image_url: card.image_url,
      headline: card.headline,
      primary_text: card.primary_text,
      description_text: card.description_text,
      tags: card.tags,
      status: card.status,
      is_winner: card.is_winner,
      notes: card.notes,
      redtrack_metrics: card.redtrack_metrics,
      compliance_status: card.compliance_status,
      compliance_notes: card.compliance_notes,
    };

    const { error } = await supabase
      .from('creative_cards')
      .insert(newCard);

    if (error) {
      console.error(`  Error inserting creative_card "${card.title}":`, error.message);
    } else {
      console.log(`  Imported creative_card: ${card.title}`);
    }
  }
}

async function importCanvasBlocks(blocks: any[], boardIdMap: Map<string, string>): Promise<void> {
  if (!blocks || blocks.length === 0) {
    console.log('No canvas_blocks to import');
    return;
  }

  console.log(`\nImporting ${blocks.length} canvas_blocks...`);

  for (const block of blocks) {
    const newBoardId = block.agent_board_id ? boardIdMap.get(block.agent_board_id) : null;

    // Check if block already exists
    const { data: existing } = await supabase
      .from('canvas_blocks')
      .select('id')
      .eq('title', block.title)
      .eq('agent_board_id', newBoardId)
      .maybeSingle();

    if (existing) {
      console.log(`  Canvas block "${block.title}" already exists, skipping`);
      continue;
    }

    const newBlock = {
      agent_board_id: newBoardId,
      type: block.type,
      content: block.content,
      asset_id: block.asset_id,
      position_x: block.position_x,
      position_y: block.position_y,
      width: block.width,
      height: block.height,
      group_id: block.group_id,
      title: block.title,
      url: block.url,
      file_path: block.file_path,
      color: block.color,
      metadata: block.metadata,
      associated_prompt_id: block.associated_prompt_id,
      instruction_prompt: block.instruction_prompt,
      parsing_status: block.parsing_status,
    };

    const { error } = await supabase
      .from('canvas_blocks')
      .insert(newBlock);

    if (error) {
      console.error(`  Error inserting canvas_block "${block.title}":`, error.message);
    } else {
      console.log(`  Imported canvas_block: ${block.title}`);
    }
  }
}

async function importAssets(assets: any[], boardIdMap: Map<string, string>): Promise<void> {
  if (!assets || assets.length === 0) {
    console.log('No assets to import');
    return;
  }

  console.log(`\nImporting ${assets.length} assets...`);

  // Dedupe assets by name+type
  const seen = new Set<string>();
  const uniqueAssets = assets.filter(asset => {
    const key = `${asset.name}-${asset.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`  (${assets.length - uniqueAssets.length} duplicates filtered out)`);

  for (const asset of uniqueAssets) {
    const newBoardId = asset.agent_board_id ? boardIdMap.get(asset.agent_board_id) : null;

    // Check if asset already exists
    const { data: existing } = await supabase
      .from('assets')
      .select('id')
      .eq('name', asset.name)
      .eq('type', asset.type)
      .maybeSingle();

    if (existing) {
      console.log(`  Asset "${asset.name}" already exists, skipping`);
      continue;
    }

    // Only include columns that exist in the destination schema
    // Schema: id, name, type, url_or_path, text_content, tags, niche_tag, 
    //         agent_board_id, enabled, status, group_id, created_at, updated_at
    const newAsset = {
      name: asset.name,
      type: asset.type,
      url_or_path: asset.url_or_path,
      text_content: asset.text_content,
      tags: asset.tags,
      niche_tag: asset.niche_tag,
      agent_board_id: newBoardId,
      enabled: asset.enabled ?? true,
      status: asset.status || 'active',
      group_id: asset.group_id,
      // Note: category, description, file_size, mime_type, thumbnail_url, scraped_content 
      // do NOT exist in the destination schema
    };

    const { error } = await supabase
      .from('assets')
      .insert(newAsset);

    if (error) {
      console.error(`  Error inserting asset "${asset.name}":`, error.message);
    } else {
      console.log(`  Imported asset: ${asset.name}`);
    }
  }
}

async function importChatSessions(
  sessions: any[], 
  messages: any[],
  boardIdMap: Map<string, string>,
  clientId: string | null,
  userId: string | null
): Promise<void> {
  if (!sessions || sessions.length === 0) {
    console.log('No chat_sessions to import');
    return;
  }

  if (!userId) {
    console.log('No user ID available, skipping chat_sessions import');
    return;
  }

  console.log(`\nImporting ${sessions.length} chat_sessions...`);

  const sessionIdMap = new Map<string, string>();

  for (const session of sessions) {
    // Our schema is different - map to new schema
    const newSession = {
      client_id: clientId,
      user_id: userId,
      title: session.title || 'Imported Chat',
    };

    const { data: inserted, error } = await supabase
      .from('chat_sessions')
      .insert(newSession)
      .select('id')
      .single();

    if (error) {
      console.error(`  Error inserting chat_session:`, error.message);
    } else if (inserted) {
      sessionIdMap.set(session.id, inserted.id);
      console.log(`  Imported chat_session: ${session.title || 'Untitled'}`);
    }
  }

  // Import messages if any
  if (messages && messages.length > 0) {
    console.log(`\nImporting ${messages.length} chat_messages...`);

    for (const msg of messages) {
      const newSessionId = sessionIdMap.get(msg.chat_session_id);
      if (!newSessionId) {
        console.log(`  Skipping message - session not found`);
        continue;
      }

      const newMsg = {
        chat_session_id: newSessionId,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(newMsg);

      if (error) {
        console.error(`  Error inserting chat_message:`, error.message);
      } else {
        console.log(`  Imported chat_message (${msg.role})`);
      }
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Calendar/Launch Data Import Script');
  console.log('='.repeat(60));
  console.log(`\nTarget: ${SUPABASE_URL}`);

  // Load export data
  const exportPath = path.join(process.cwd(), 'calendar-launch-export.json');
  
  if (!fs.existsSync(exportPath)) {
    console.error(`\nExport file not found: ${exportPath}`);
    process.exit(1);
  }

  const exportData: ExportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));

  if (!exportData.success) {
    console.error('\nExport file indicates failure. Check the source data.');
    process.exit(1);
  }

  console.log('\nExport Summary:');
  console.log(`  - chat_sessions: ${exportData.data.chat_sessions?.length || 0}`);
  console.log(`  - chat_messages: ${exportData.data.chat_messages?.length || 0}`);
  console.log(`  - scheduled_posts: ${exportData.data.scheduled_posts?.length || 0}`);
  console.log(`  - agent_boards: ${exportData.data.agent_boards?.length || 0}`);
  console.log(`  - creative_cards: ${exportData.data.creative_cards?.length || 0}`);
  console.log(`  - canvas_blocks: ${exportData.data.canvas_blocks?.length || 0}`);
  console.log(`  - assets: ${exportData.data.assets?.length || 0}`);

  // Get default client and user
  const clientId = await getOrCreateDefaultClient();
  const userId = await getFirstUserId();

  console.log(`\nUsing client_id: ${clientId || '(none)'}`);
  console.log(`Using user_id: ${userId || '(none)'}`);

  // Import in dependency order
  const boardIdMap = await importAgentBoards(exportData.data.agent_boards, clientId);
  
  await importCreativeCards(exportData.data.creative_cards, boardIdMap);
  await importCanvasBlocks(exportData.data.canvas_blocks, boardIdMap);
  await importAssets(exportData.data.assets, boardIdMap);
  
  await importChatSessions(
    exportData.data.chat_sessions,
    exportData.data.chat_messages,
    boardIdMap,
    clientId,
    userId
  );

  console.log('\n' + '='.repeat(60));
  console.log('Import complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);

