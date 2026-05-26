"use client";

import { useState, useEffect } from "react";
import {
  getSettings,
  updateSetting,
  deleteSetting,
  createSetting,
  matchSettingCategory,
  PRICE_TOGGLE_CATEGORIES,
} from "@/lib/admin-api";
import type { Setting } from "@/lib/admin-api";
import { SETTING_CATEGORIES } from "@/lib/admin-api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useTranslation } from "@/lib/i18n";
import { Eye, EyeOff, Settings2 } from "lucide-react";

// Settings that should use image upload instead of text input
const IMAGE_SETTINGS = new Set(["logo", "favicon", "logoUrl", "faviconUrl"]);

interface EditableSetting extends Setting {
  isEditing: boolean;
  valueEn: string;
  valueHe: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<EditableSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValueEn, setNewValueEn] = useState("");
  const [newValueHe, setNewValueHe] = useState("");
  const [newCategory, setNewCategory] = useState(SETTING_CATEGORIES[0]);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data.map((s) => ({ ...s, isEditing: false })));
    } catch {
      setError("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-seed price visibility toggles on mount
  useEffect(() => {
    if (settings.length === 0) return; // Still loading

    const existingKeys = new Set(settings.map((s) => s.key));
    const missing = PRICE_TOGGLE_CATEGORIES.filter(
      (t) => !existingKeys.has(t.key),
    );

    if (missing.length === 0) return;

    Promise.all(
      missing.map((t) =>
        createSetting({
          key: t.key,
          valueEn: "true",
          valueHe: "true",
          category: "Display",
        }).catch(() => {
          /* key might already exist from another tab */
        }),
      ),
    ).then(() => loadSettings());
  }, [settings.length]);

  const groupedSettings = SETTING_CATEGORIES.filter(
    (cat) => cat !== "Display",
  ).map((category) => ({
    category,
    settings: settings.filter((s) =>
      matchSettingCategory(s.category, category),
    ),
  }));

  const startEditing = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, isEditing: true } : s)),
    );
  };

  const cancelEditing = (key: string) => {
    const original = settings.find((s) => s.key === key && !s.isEditing);
    if (original) {
      setSettings((prev) =>
        prev.map((s) =>
          s.key === key
            ? {
                ...s,
                isEditing: false,
                valueEn: original.valueEn,
                valueHe: original.valueHe,
              }
            : s,
        ),
      );
    } else {
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, isEditing: false } : s)),
      );
    }
  };

  const saveSetting = async (key: string) => {
    const setting = settings.find((s) => s.key === key);
    if (!setting) return;

    try {
      console.log(`Saving setting ${key}:`, {
        valueEn: setting.valueEn,
        valueHe: setting.valueHe,
      });
      const updated = await updateSetting(key, {
        valueEn: setting.valueEn,
        valueHe: setting.valueHe,
      });
      console.log(`Setting ${key} saved:`, updated);
      // Re-fetch from server to ensure we have the latest data
      await loadSettings();
      setSuccess(`Setting "${key}" updated.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(`Failed to save setting ${key}:`, err);
      setError(
        `Failed to update "${key}". ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteSetting(key);
      await loadSettings();
      setConfirmDelete(null);
      setSuccess(`Setting "${key}" deleted.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(`Failed to delete setting ${key}:`, err);
      setError(`Failed to delete "${key}".`);
    }
  };

  const togglePriceVisibility = async (toggle: {
    key: string;
    label: string;
  }) => {
    const setting = settings.find((s) => s.key === toggle.key);
    const newVal = setting?.valueEn === "true" ? "false" : "true";

    setSettings((prev) =>
      prev.map((s) =>
        s.key === toggle.key ? { ...s, valueEn: newVal, valueHe: newVal } : s,
      ),
    );

    try {
      const updateData = {
        key: toggle.key,
        valueEn: newVal,
        valueHe: newVal,
      };
      const existing = settings.find((s) => s.key === toggle.key);
      if (existing) {
        await updateSetting(toggle.key, updateData);
      } else {
        await createSetting(updateData);
      }
      setSuccess(`"${toggle.label}" visibility updated.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      // Revert on failure
      setSettings((prev) =>
        prev.map((s) =>
          s.key === toggle.key
            ? {
                ...s,
                valueEn: setting?.valueEn || "true",
                valueHe: setting?.valueHe || "true",
              }
            : s,
        ),
      );
      setError(`Failed to update "${toggle.label}".`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
            {t.adminSettings}
          </h1>
          <p className="font-body text-charcoal-500">
            Manage site-wide settings and configuration
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-body text-sm mb-4">
          {success}
        </div>
      )}

      {/* Settings by category */}
      <div className="space-y-8">
        {groupedSettings.map(({ category, settings: categorySettings }) => (
          <div key={category}>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-4">
              {category}
            </h2>
            {categorySettings.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="font-body text-charcoal-500">
                  No settings in this category.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {categorySettings.map((setting) => (
                  <Card key={setting.key} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-charcoal-800">
                          {setting.key}
                        </h3>
                        <p className="font-body text-xs text-charcoal-400">
                          Updated:{" "}
                          {new Date(setting.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {setting.isEditing ? (
                          <>
                            <Button
                              onClick={() => saveSetting(setting.key)}
                              variant="primary"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => cancelEditing(setting.key)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => startEditing(setting.key)}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            {confirmDelete === setting.key ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => handleDelete(setting.key)}
                                  variant="secondary"
                                  size="sm"
                                  className="!bg-red-500 hover:!bg-red-600"
                                >
                                  Delete
                                </Button>
                                <Button
                                  onClick={() => setConfirmDelete(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setConfirmDelete(setting.key)}
                                variant="outline"
                                size="sm"
                                className="!border-red-300 !text-red-500 hover:!bg-red-500 hover:!text-white"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {setting.isEditing ? (
                      (() => {
                        if (IMAGE_SETTINGS.has(setting.key)) {
                          return (
                            <ImageUpload
                              label={setting.key}
                              value={setting.valueEn}
                              onChange={(url) => {
                                setSettings((prev) =>
                                  prev.map((s) =>
                                    s.key === setting.key
                                      ? { ...s, valueEn: url, valueHe: url }
                                      : s,
                                  ),
                                );
                              }}
                            />
                          );
                        }
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Value (English)"
                              name={`valueEn-${setting.key}`}
                              value={setting.valueEn}
                              onChange={(e) => {
                                setSettings((prev) =>
                                  prev.map((s) =>
                                    s.key === setting.key
                                      ? { ...s, valueEn: e.target.value }
                                      : s,
                                  ),
                                );
                              }}
                            />
                            <Input
                              label="ערך (עברית)"
                              name={`valueHe-${setting.key}`}
                              value={setting.valueHe}
                              onChange={(e) => {
                                setSettings((prev) =>
                                  prev.map((s) =>
                                    s.key === setting.key
                                      ? { ...s, valueHe: e.target.value }
                                      : s,
                                  ),
                                );
                              }}
                            />
                          </div>
                        );
                      })()
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-body text-xs text-charcoal-400 mb-1">
                            English
                          </p>
                          <p className="font-body text-sm text-charcoal-600 bg-cream-50 rounded-lg px-3 py-2">
                            {setting.valueEn || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-body text-xs text-charcoal-400 mb-1">
                            עברית
                          </p>
                          <p className="font-body text-sm text-charcoal-600 bg-cream-50 rounded-lg px-3 py-2">
                            {setting.valueHe || "—"}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Price visibility toggles — Display category */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Settings2 size={20} className="text-charcoal-800" />
          <h2 className="font-heading text-xl font-semibold text-charcoal-800">
            Display Settings
          </h2>
        </div>
        <p className="font-body text-sm text-charcoal-500 mb-4">
          Control which categories show prices on the public website.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRICE_TOGGLE_CATEGORIES.map((toggle) => {
            const setting = settings.find((s) => s.key === toggle.key);
            const isEnabled = setting?.valueEn === "true";

            return (
              <Card
                key={toggle.key}
                className="p-4 cursor-pointer hover:border-rose-300 transition-colors"
                onClick={() => togglePriceVisibility(toggle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isEnabled ? "bg-rose-100" : "bg-charcoal-100"
                      }`}
                    >
                      {isEnabled ? (
                        <Eye size={18} className="text-rose-400" />
                      ) : (
                        <EyeOff size={18} className="text-charcoal-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-charcoal-800">
                        {toggle.label}
                      </p>
                      <p className="font-body text-xs text-charcoal-400">
                        {isEnabled ? "Prices visible" : "Prices hidden"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                      isEnabled ? "bg-rose-400" : "bg-charcoal-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        isEnabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
