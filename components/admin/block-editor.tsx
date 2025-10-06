'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Type, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type BlockType = 'paragraph' | 'image' | 'link' | 'heading';

export interface Block {
  id: string;
  type: BlockType;
  text?: string;
  url?: string;
  alt?: string;
  label?: string;
  level?: number;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      ...(type === 'paragraph' && { text: '' }),
      ...(type === 'heading' && { text: '', level: 2 }),
      ...(type === 'image' && { url: '', alt: '' }),
      ...(type === 'link' && { url: '', label: '' }),
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(blocks.map(block => block.id === id ? { ...block, ...updates } : block));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      {/* Add block buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('paragraph')}
        >
          <Type className="w-4 h-4 mr-2" />
          Párrafo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('heading')}
        >
          <Type className="w-4 h-4 mr-2" />
          Título
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('image')}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Imagen
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('link')}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Enlace
        </Button>
      </div>

      {/* Blocks list */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed rounded-lg">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Agrega bloques para empezar a crear contenido</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                {/* Block content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {block.type === 'paragraph' && 'Párrafo'}
                      {block.type === 'heading' && 'Título'}
                      {block.type === 'image' && 'Imagen'}
                      {block.type === 'link' && 'Enlace'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  {block.type === 'paragraph' && (
                    <Textarea
                      placeholder="Escribe tu texto..."
                      value={block.text || ''}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      rows={4}
                    />
                  )}

                  {block.type === 'heading' && (
                    <div className="space-y-2">
                      <Select
                        value={String(block.level || 2)}
                        onValueChange={(value) => updateBlock(block.id, { level: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">H1 - Título principal</SelectItem>
                          <SelectItem value="2">H2 - Subtítulo</SelectItem>
                          <SelectItem value="3">H3 - Sección</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Texto del título..."
                        value={block.text || ''}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      />
                    </div>
                  )}

                  {block.type === 'image' && (
                    <div className="space-y-2">
                      <div>
                        <Label>URL de la imagen</Label>
                        <Input
                          placeholder="https://..."
                          value={block.url || ''}
                          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Texto alternativo</Label>
                        <Input
                          placeholder="Descripción de la imagen"
                          value={block.alt || ''}
                          onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                        />
                      </div>
                      {block.url && (
                        <img
                          src={block.url}
                          alt={block.alt || ''}
                          className="max-w-xs rounded border"
                        />
                      )}
                    </div>
                  )}

                  {block.type === 'link' && (
                    <div className="space-y-2">
                      <div>
                        <Label>Texto del enlace</Label>
                        <Input
                          placeholder="Haz clic aquí"
                          value={block.label || ''}
                          onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          placeholder="https://..."
                          value={block.url || ''}
                          onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
