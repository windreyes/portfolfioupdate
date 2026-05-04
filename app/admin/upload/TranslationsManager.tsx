"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Save, Search, RefreshCw } from "lucide-react"

type LangDict = Record<string, string>
type Translations = { en: LangDict; es: LangDict }

// Group keys by prefix
function groupKeys(keys: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {}
    for (const key of keys) {
        const prefix = key.includes("_") ? key.split("_")[0] : "general"
        if (!groups[prefix]) groups[prefix] = []
        groups[prefix].push(key)
    }
    return groups
}

export default function TranslationsManager() {
    const [translations, setTranslations] = useState<Translations | null>(null)
    const [draft, setDraft] = useState<Translations | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState("")
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        fetch("/api/translations")
            .then((r) => r.json())
            .then((data) => {
                setTranslations(data)
                setDraft(JSON.parse(JSON.stringify(data)))
            })
            .catch(() => toast.error("Could not load translations"))
            .finally(() => setLoading(false))
    }, [])

    function handleChange(lang: "en" | "es", key: string, value: string) {
        setDraft((prev) => {
            if (!prev) return prev
            return { ...prev, [lang]: { ...prev[lang], [key]: value } }
        })
        setDirty(true)
    }

    async function handleSave() {
        if (!draft) return
        setSaving(true)
        try {
            const res = await fetch("/api/translations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            })
            if (!res.ok) throw new Error()
            setTranslations(JSON.parse(JSON.stringify(draft)))
            setDirty(false)
            toast.success("Translations saved")
        } catch {
            toast.error("Could not save translations")
        } finally {
            setSaving(false)
        }
    }

    function handleReset() {
        if (!translations) return
        setDraft(JSON.parse(JSON.stringify(translations)))
        setDirty(false)
    }

    const allKeys = useMemo(() => {
        if (!draft) return []
        return Object.keys(draft.en)
    }, [draft])

    const filteredKeys = useMemo(() => {
        if (!search.trim()) return allKeys
        const q = search.toLowerCase()
        return allKeys.filter(
            (k) =>
                k.toLowerCase().includes(q) ||
                draft?.en[k]?.toLowerCase().includes(q) ||
                draft?.es[k]?.toLowerCase().includes(q)
        )
    }, [allKeys, search, draft])

    const groups = useMemo(() => groupKeys(filteredKeys), [filteredKeys])

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading translations…
            </div>
        )
    }

    if (!draft) return <p className="text-destructive text-sm">Could not load translations.</p>

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search keys or text…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" onClick={handleReset} disabled={!dirty || saving}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={handleSave} disabled={!dirty || saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save all
                </Button>
                {dirty && <Badge variant="secondary" className="bg-orange-100 text-orange-800">Unsaved changes</Badge>}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Key</span>
                <span>English</span>
                <span>Español</span>
            </div>

            {/* Groups */}
            {Object.entries(groups).map(([group, keys]) => (
                <Card key={group}>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm capitalize text-muted-foreground">{group}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {keys.map((key) => {
                            const enVal = draft.en[key] ?? ""
                            const esVal = draft.es[key] ?? ""
                            const isLong = enVal.length > 80 || esVal.length > 80
                            return (
                                <div key={key} className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-start">
                                    <div className="pt-2">
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground break-all">
                                            {key}
                                        </code>
                                    </div>
                                    {isLong ? (
                                        <>
                                            <Textarea
                                                value={enVal}
                                                onChange={(e) => handleChange("en", key, e.target.value)}
                                                className="text-sm min-h-[80px] resize-y"
                                            />
                                            <Textarea
                                                value={esVal}
                                                onChange={(e) => handleChange("es", key, e.target.value)}
                                                className="text-sm min-h-[80px] resize-y"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Input
                                                value={enVal}
                                                onChange={(e) => handleChange("en", key, e.target.value)}
                                                className="text-sm"
                                            />
                                            <Input
                                                value={esVal}
                                                onChange={(e) => handleChange("es", key, e.target.value)}
                                                className="text-sm"
                                            />
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
