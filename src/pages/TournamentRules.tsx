
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TournamentRules() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Règles du Tournoi</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Règlement Général</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              <section>
                <h3 className="font-bold mb-2">1. Participation</h3>
                <p>Les matchs doivent être joués à l'heure précise indiquée.</p>
              </section>
              
              <section>
                <h3 className="font-bold mb-2">2. Code de Match</h3>
                <p>Un code unique de 10 lettres est généré pour chaque match.</p>
              </section>
              
              <section>
                <h3 className="font-bold mb-2">3. Match Nul</h3>
                <p>En cas de match nul, une relance immédiate est obligatoire avec le même code.</p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
