
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
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
})

export function WaitlistForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
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
    } catch (error) {
      console.error('Error submitting to waitlist:', error)
      if (error.code === '23505') { // Unique violation
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
                  placeholder="Your name (optional)"
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
