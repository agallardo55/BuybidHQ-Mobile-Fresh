
import { useState, useEffect, useRef, lazy, Suspense } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"

// Lazy load ReCAPTCHA to reduce initial bundle size
const ReCAPTCHA = lazy(() => import("react-google-recaptcha"))
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  recaptchaToken: z.string().min(1, "Please complete the reCAPTCHA verification"),
})

export function WaitlistForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [siteKey, setSiteKey] = useState<string>("")
  const recaptchaRef = useRef<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      recaptchaToken: "",
    },
  })

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-recaptcha-key')
        if (error) throw error
        setSiteKey(data.siteKey)
      } catch (error) {
        console.error('Error fetching reCAPTCHA site key:', error)
        toast.error("Failed to load security verification")
      }
    }
    fetchSiteKey()
  }, [])

  const handleRecaptchaChange = (token: string | null) => {
    form.setValue('recaptchaToken', token || '')
    if (token) {
      form.clearErrors('recaptchaToken')
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Verify reCAPTCHA first
      const { data: recaptchaData, error: recaptchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: values.recaptchaToken }
      })

      if (recaptchaError || !recaptchaData?.success) {
        throw new Error('reCAPTCHA verification failed')
      }

      // Submit to waitlist
      const { error } = await supabase
        .from('waitlist')
        .insert([{ 
          email: values.email, 
          name: values.name || null,
          source: 'website' 
        }])

      if (error) throw error

      toast.success("Thank you for joining our waitlist!")
      form.reset()
      recaptchaRef.current?.reset()
    } catch (error) {
      console.error('Error submitting to waitlist:', error)
      if (error.message?.includes('reCAPTCHA')) {
        toast.error("Security verification failed. Please try again.")
        recaptchaRef.current?.reset()
        form.setValue('recaptchaToken', '')
      } else if (error.code === '23505') { // Unique violation
        toast.error("This email is already on our waitlist")
      } else {
        toast.error("Failed to join waitlist. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm mx-auto">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Your full name"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-200" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recaptchaToken"
          render={() => (
            <FormItem>
              <FormControl>
                <div className="flex justify-center">
                  {siteKey && (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <Suspense fallback={<div className="h-[78px] flex items-center justify-center text-white/60">Loading verification...</div>}>
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={siteKey}
                          onChange={handleRecaptchaChange}
                          theme="light"
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-red-200" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-white text-[#325AE7] hover:bg-white/90"
        >
          {isLoading ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>
    </Form>
  )
}
