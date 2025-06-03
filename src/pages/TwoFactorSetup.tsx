
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useState } from "react"
import { QrCode, Smartphone } from "lucide-react"

export default function TwoFactorSetup() {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<"app" | "sms" | null>(null)
  const [verificationCode, setVerificationCode] = useState("")

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <CardTitle>Configuration de la 2FA</CardTitle>
          <CardDescription>
            Sécurisez votre compte avec l'authentification à deux facteurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  method === "app" ? "border-asc-purple bg-asc-purple/5" : "hover:border-asc-purple"
                }`}
                onClick={() => setMethod("app")}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">Application d'authentification</h3>
                    <p className="text-sm text-gray-500">Google Authenticator, Authy, etc.</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  method === "sms" ? "border-asc-purple bg-asc-purple/5" : "hover:border-asc-purple"
                }`}
                onClick={() => setMethod("sms")}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium">SMS</h3>
                    <p className="text-sm text-gray-500">Code par message texte</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => setStep(2)}
                disabled={!method}
              >
                Continuer
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {method === "app" && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <img
                      src="placeholder.svg"
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-center text-sm text-gray-500">
                  {method === "app" 
                    ? "Scannez le QR code avec votre application d'authentification"
                    : "Un code a été envoyé à votre numéro de téléphone"
                  }
                </p>

                <InputOTP
                  value={verificationCode}
                  onChange={setVerificationCode}
                  maxLength={6}
                  render={({ slots }) => (
                    <InputOTPGroup className="gap-2 flex justify-center">
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} />
                      ))}
                    </InputOTPGroup>
                  )}
                />

                <Button className="w-full">
                  Activer la 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
