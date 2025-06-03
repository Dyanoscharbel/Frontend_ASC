
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function OTPVerification() {
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()
  
  const handleVerify = () => {
    // Pour la maquette, redirection directe
    navigate("/dashboard")
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle>Vérification</CardTitle>
          <CardDescription>
            Entrez le code à 6 chiffres envoyé à votre email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2 flex justify-center">
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} />
                ))}
              </InputOTPGroup>
            )}
          />
          <Button className="w-full" onClick={handleVerify}>
            Vérifier
          </Button>
          <Button variant="link" className="w-full">
            Renvoyer le code
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
