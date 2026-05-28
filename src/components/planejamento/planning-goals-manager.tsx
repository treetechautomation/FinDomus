import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type Props = {
  categories: any[];
  availableCategories: string[];
  normalizeText: (value: string) => string;

  updateCategory: (id: string, patch: any) => void;
  removeCategory: (id: string) => void;

  addTransactionCategoryToGoal: (
    goalId: string,
    transactionCategory: string
  ) => void;

  removeTransactionCategoryFromGoal: (
    goalId: string,
    category: string
  ) => void;

  addCategory: () => void;
  reset: () => void;
  save: () => void;

  canSave: boolean;
  saving: boolean;
};

export function PlanningGoalsManager({
  categories,
  availableCategories,
  normalizeText,
  updateCategory,
  removeCategory,
  addTransactionCategoryToGoal,
  removeTransactionCategoryFromGoal,
  addCategory,
  reset,
  save,
  canSave,
  saving,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas metas</CardTitle>

        <CardDescription>
          Edite nomes, cores e percentuais.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {categories.map((item) => (
          <div key={item.id} className="rounded-xl border p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_120px_60px_auto]">
              <Input
                value={item.name}
                onChange={(e) =>
                  updateCategory(item.id, {
                    name: e.target.value,
                  })
                }
              />

              <Input
                type="number"
                value={item.percentage}
                onChange={(e) =>
                  updateCategory(item.id, {
                    percentage: Math.max(
                      0,
                      Math.min(
                        100,
                        Number(e.target.value)
                      )
                    ),
                  })
                }
              />

              <input
                type="color"
                value={item.color}
                onChange={(e) =>
                  updateCategory(item.id, {
                    color: e.target.value,
                  })
                }
                className="h-10 w-full rounded-md border bg-background"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => removeCategory(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>

                <span className="font-semibold text-foreground">
                  {item.percentage}%
                </span>

                <span>100%</span>
              </div>

              <Slider
                value={[item.percentage]}
                max={100}
                step={1}
                onValueChange={(value) =>
                  updateCategory(item.id, {
                    percentage: value[0] ?? 0,
                  })
                }
              />
            </div>

            <div className="mt-5 space-y-3 rounded-xl border bg-background/40 p-4">
              <div>
                <div className="text-sm font-bold">
                  Categorias vinculadas
                </div>

                <div className="text-xs text-muted-foreground">
                  Toda despesa lançada nessas categorias
                  será abatida automaticamente desta meta.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(item.categories || []).map(
                  (category: string) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        removeTransactionCategoryFromGoal(
                          item.id,
                          category
                        )
                      }
                      className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      {category} ×
                    </button>
                  )
                )}

                {(!item.categories ||
                  item.categories.length === 0) && (
                  <div className="text-xs text-muted-foreground">
                    Nenhuma categoria vinculada ainda.
                  </div>
                )}
              </div>

              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                defaultValue=""
                onChange={(e) => {
                  addTransactionCategoryToGoal(
                    item.id,
                    e.target.value
                  );

                  e.currentTarget.value = '';
                }}
              >
                <option value="">
                  Adicionar categoria a esta meta...
                </option>

                {availableCategories
                  .filter(
                    (category) =>
                      !(item.categories || []).some(
                        (linked: string) =>
                          normalizeText(linked) ===
                          normalizeText(category)
                      )
                  )
                  .map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar meta
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Resetar
            </Button>

            <Button
              type="button"
              disabled={!canSave || saving}
              onClick={save}
            >
              <Save className="mr-2 h-4 w-4" />

              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
