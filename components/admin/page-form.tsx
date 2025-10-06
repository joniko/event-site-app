'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pages as pagesSchema } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BlockEditor, { Block } from './block-editor';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';

type Page = typeof pagesSchema.$inferSelect;

interface PageFormProps {
  page?: Page;
}

const PAGE_TYPES = [
  { value: 'FEED', label: 'Feed', description: 'Lista de posts/noticias' },
  { value: 'PROGRAMA', label: 'Programa', description: 'Agenda con sesiones' },
  { value: 'ENTRADAS', label: 'Entradas', description: 'Tickets de Fint' },
  { value: 'STANDS', label: 'Stands', description: 'Grid de instituciones' },
  { value: 'CUSTOM', label: 'Custom', description: 'Bloques CMS libres' },
];

const COMMON_ICONS = [
  'Home', 'Calendar', 'Ticket', 'Building2', 'FileText',
  'Info', 'Mail', 'Users', 'Settings', 'HelpCircle',
  'Image', 'Video', 'Music', 'Book', 'Briefcase',
];

export default function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const isEditing = !!page;

  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    type: page?.type || 'CUSTOM',
    icon: page?.icon || 'FileText',
    visible: page?.visible ?? true,
    order: page?.order || 0,
    blocks: (page?.blocks as Block[]) || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/admin/pages/${page.id}` : '/api/admin/pages';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      toast.success(isEditing ? 'Página actualizada' : 'Página creada');
      router.push('/admin/paginas');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const showContentTab = formData.type === 'CUSTOM';

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <Tabs defaultValue={showContentTab ? "content" : "settings"} className="w-full">
        <TabsList className="mb-6">
          {showContentTab && (
            <TabsTrigger value="content">
              📝 Contenido
            </TabsTrigger>
          )}
          <TabsTrigger value="settings">
            ⚙️ Configuración
          </TabsTrigger>
        </TabsList>

        {/* Tab: Contenido (solo para CUSTOM) */}
        {showContentTab && (
          <TabsContent value="content">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Editor de Bloques
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Crea contenido personalizado usando bloques de texto, imágenes y enlaces
                </p>
              </div>

              <BlockEditor
                blocks={formData.blocks}
                onChange={(blocks) => setFormData(prev => ({ ...prev, blocks }))}
              />
            </div>
          </TabsContent>
        )}

        {/* Tab: Configuración */}
        <TabsContent value="settings">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {/* Tipo de Módulo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Módulo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-sm text-gray-500">
                  No se puede cambiar el tipo de módulo al editar
                </p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ej: Programa del Evento"
                required
                maxLength={100}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="programa"
                  required
                  pattern="^[a-z0-9-]+$"
                  title="Solo minúsculas, números y guiones"
                />
              </div>
              <p className="text-sm text-gray-500">
                Solo letras minúsculas, números y guiones. Ej: programa, mi-pagina
              </p>
            </div>

            {/* Icono */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icono *</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    {getIcon(formData.icon)}
                    <span>{formData.icon}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COMMON_ICONS.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        {getIcon(iconName)}
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Icono que aparecerá en la navegación
              </p>
            </div>

            {/* Orden */}
            <div className="space-y-2">
              <Label htmlFor="order">Orden *</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                min="0"
                required
              />
              <p className="text-sm text-gray-500">
                Posición en la navegación (menor número = más arriba)
              </p>
            </div>

            {/* Visible */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visible">Página visible</Label>
                <p className="text-sm text-gray-500">
                  Si está oculta, no aparecerá en la navegación pública
                </p>
              </div>
              <Switch
                id="visible"
                checked={formData.visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Acciones (fuera de tabs, siempre visible) */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Página'}
        </Button>
      </div>
    </form>
  );
}
