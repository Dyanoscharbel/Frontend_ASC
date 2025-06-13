import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function TournamentPayment() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Inscription au Tournoi</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Frais d'inscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">5000 FCFA</div>
              <div className="space-y-4">
                <RadioGroup defaultValue="flutterwave">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flutterwave" id="flutterwave" />
                    <Label htmlFor="flutterwave">Flutterwave</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paydunya" id="paydunya" />
                    <Label htmlFor="paydunya">PayDunya</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mtn" id="mtn" />
                    <Label htmlFor="mtn">MTN MoMo</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button className="w-full mt-6">Procéder au paiement</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}