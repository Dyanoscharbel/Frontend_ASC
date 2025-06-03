import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Info, Calendar, Gift, Maximize2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/services/api";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "update":
      return <Info className="h-5 w-5 text-blue-500" />;
    case "event":
      return <Calendar className="h-5 w-5 text-purple-500" />;
    case "info":
      return <Bell className="h-5 w-5 text-yellow-500" />;
    case "reward":
      return <Gift className="h-5 w-5 text-green-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "update":
      return <Badge className="bg-blue-500">Mise à jour</Badge>;
    case "event":
      return <Badge className="bg-purple-500">Événement</Badge>;
    case "info":
      return <Badge className="bg-yellow-500">Information</Badge>;
    case "reward":
      return <Badge className="bg-green-500">Récompense</Badge>;
    default:
      return <Badge>Information</Badge>;
  }
};

const Notifications = () => {
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunication, setSelectedCommunication] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    api.get('/communications?status=sent')
      .then(res => setCommunications(res.data.communications || []))
      .catch(err => {
        setCommunications([]);
        console.error('Erreur lors de la récupération des communications:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
          >
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg"
            >
              <Bell className="h-8 w-8 text-white" />
            </motion.div>
              <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Communications
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">
                  Messages et annonces de l'équipe ASC
                </p>
              </div>
            </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/90 shadow-xl rounded-2xl border-0">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Annonces récentes
              </CardTitle>
              </CardHeader>
            <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-[250px]" />
                          <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : communications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl shadow-inner mb-4">
                    <Bell className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Aucune communication</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-lg">
                    Il n'y a actuellement aucune communication de l'équipe ASC.
                  </p>
                </motion.div>
                ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {communications.map((comm, index) => (
                      <motion.div
                        key={comm._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700/50 
                                 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300
                                 hover:border-purple-200 dark:hover:border-purple-800"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 
                                        dark:from-purple-900 dark:to-blue-900 group-hover:scale-110 transition-transform duration-300">
                            {getCategoryIcon(comm.category || 'info')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-xl text-gray-900 dark:text-white">{comm.title}</h3>
                              {getCategoryLabel(comm.category || 'info')}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(comm.scheduledDate || comm.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                              {comm.content?.length > 150 
                                ? `${comm.content.substring(0, 150)}...` 
                                : comm.content
                              }
                            </p>
                            <div className="flex justify-end mt-3">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="group flex items-center gap-2 text-purple-600 hover:text-purple-700 
                                         hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                onClick={() => { setSelectedCommunication(comm); setIsDialogOpen(true); }}
                              >
                                <span>Voir plus</span>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-2xl">
          {selectedCommunication && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 
                                dark:from-purple-900 dark:to-blue-900">
                    {getCategoryIcon(selectedCommunication.category || 'info')}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedCommunication.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-2">
                      <span className="text-sm">
                        {new Date(selectedCommunication.scheduledDate || selectedCommunication.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                  </span>
                      {getCategoryLabel(selectedCommunication.category || 'info')}
                </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-6">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg">
                  {selectedCommunication.content}
                </p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications; 