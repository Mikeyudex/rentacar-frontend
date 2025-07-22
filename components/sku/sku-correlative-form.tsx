"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateSequenceSku } from "@/services/sku-service"
import { getNextSku } from "@/services/product-service"


export function SkuCorrelativeForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [correlativeCurrent, setCorrelativeCurrent] = useState<string | null>(null)


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await updateSequenceSku(correlativeCurrent || "")

            if (response.success) {
                toast({
                    title: "Correlativo modificado",
                    description: response.message,
                    variant: "success",
                })
            } else {
                toast({
                    title: "Error",
                    description: response.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al cambiar el correlativo",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        (async () => {
            const nextSku = await getNextSku();
            setCorrelativeCurrent((nextSku - 1).toString());
        })();
    }, []);

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                {/*  <h1 className="text-3xl font-bold">Modificar Correlativo de SKU</h1> */}
            </div>

            <div className="flex justify-center max-w w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Correlativo</CardTitle>
                        <CardDescription>Ingrese el nuevo correlativo de SKU</CardDescription>
                    </CardHeader>
                    <CardContent>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor={"correlativo"}>Correlativo *</Label>
                                <Input
                                    id="correlativo"
                                    name="correlativo"
                                    placeholder="Ingrese el número de parte"
                                    value={correlativeCurrent?.toString() || ""}
                                    onChange={(e) => setCorrelativeCurrent(e.target.value)}
                                    required />
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Cambiar Correlativo
                            </Button>
                        </form>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
