import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { predictProfit, type PredictionInput, type PredictionResult } from "@/lib/predict";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  LogOut,
  Calculator,
  Loader2,
  DollarSign,
  History,
  FlaskConical,
  Megaphone,
  Building2,
  MapPin,
} from "lucide-react";

const STATES = ["New York", "California", "Florida"];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [rdSpend, setRdSpend] = useState("");
  const [administration, setAdministration] = useState("");
  const [marketingSpend, setMarketingSpend] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const input: PredictionInput = {
      rdSpend: parseFloat(rdSpend),
      administration: parseFloat(administration),
      marketingSpend: parseFloat(marketingSpend),
      state,
    };

    try {
      const profit = await predictProfit(input);
      const result: PredictionResult = {
        id: crypto.randomUUID(),
        input,
        profit,
        timestamp: new Date(),
      };
      setLatestResult(result);
      setHistory((prev) => [result, ...prev].slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ProfitAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.name}
            </span>
            <Button variant="ghost" size="icon" onClick={logout} title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Renseignez les données ci-dessous pour estimer le profit.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <Card className="border-border/50 shadow-lg shadow-primary/5 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-primary" />
                Prédiction de Profit
              </CardTitle>
              <CardDescription>Entrez les dépenses pour obtenir une estimation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rd" className="flex items-center gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
                      R&D Spend
                    </Label>
                    <Input
                      id="rd"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={rdSpend}
                      onChange={(e) => setRdSpend(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin" className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Administration
                    </Label>
                    <Input
                      id="admin"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={administration}
                      onChange={(e) => setAdministration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mkt" className="flex items-center gap-1.5">
                      <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
                      Marketing Spend
                    </Label>
                    <Input
                      id="mkt"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={marketingSpend}
                      onChange={(e) => setMarketingSpend(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      State
                    </Label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un état" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !state}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Calcul en cours…
                    </>
                  ) : (
                    <>
                      <Calculator />
                      Calculer le Profit
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          <div className="space-y-6 lg:col-span-2">
            {latestResult ? (
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent shadow-lg">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Profit Estimé
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold tracking-tight text-primary">
                    {fmt(latestResult.profit)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {latestResult.input.state} • {latestResult.timestamp.toLocaleTimeString("fr-FR")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Soumettez le formulaire pour voir le résultat.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-primary" />
                Historique des Prédictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Heure</th>
                      <th className="pb-2 pr-4 font-medium">R&D</th>
                      <th className="pb-2 pr-4 font-medium">Admin</th>
                      <th className="pb-2 pr-4 font-medium">Marketing</th>
                      <th className="pb-2 pr-4 font-medium">État</th>
                      <th className="pb-2 font-medium text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {r.timestamp.toLocaleTimeString("fr-FR")}
                        </td>
                        <td className="py-2.5 pr-4">{fmt(r.input.rdSpend)}</td>
                        <td className="py-2.5 pr-4">{fmt(r.input.administration)}</td>
                        <td className="py-2.5 pr-4">{fmt(r.input.marketingSpend)}</td>
                        <td className="py-2.5 pr-4">{r.input.state}</td>
                        <td className="py-2.5 text-right font-semibold text-primary">
                          {fmt(r.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
