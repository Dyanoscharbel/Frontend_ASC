
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock, AlertTriangle } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function MatchDetails() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Match #12345
                  </CardTitle>
                  <Badge>En cours</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <h3 className="font-medium">Équipe Alpha</h3>
                          <p className="text-sm text-gray-500">3 joueurs</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">2</div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <h3 className="font-medium">Équipe Beta</h3>
                          <p className="text-sm text-gray-500">3 joueurs</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">1</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <h3 className="font-medium mb-2">Détails du match</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Durée: 45:00</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Format: 3v3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          <span>Tournoi: Championnat ASC</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        Valider le score
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Signaler
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">But marqué - Équipe Alpha</p>
                      <p className="text-sm text-gray-500">35:12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">But marqué - Équipe Beta</p>
                      <p className="text-sm text-gray-500">22:45</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">But marqué - Équipe Alpha</p>
                      <p className="text-sm text-gray-500">15:30</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
