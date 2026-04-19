'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useUser,
  useAuth,
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateAnonymousSignIn,
} from '@/firebase';

import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = (values: z.infer<typeof formSchema>) => {
    initiateEmailSignIn(auth, values.email, values.password);
  };

  const handleSignUp = (values: z.infer<typeof formSchema>) => {
    initiateEmailSignUp(auth, values.email, values.password);
  };
  
  const handleAnonymousSignIn = () => {
    initiateAnonymousSignIn(auth);
  }

  const handleSignOut = () => {
    auth.signOut();
  };

  const isLoading = form.formState.isSubmitting || isUserLoading;

  if (isUserLoading) {
    return (
       <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
           <div className="flex items-center justify-center h-64">
             <Loader2 className="h-8 w-8 animate-spin text-accent" />
           </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          Profile
        </h1>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome, Moonbug!</CardTitle>
              <CardDescription>
                You are signed in as {user.isAnonymous ? 'an anonymous user' : user.email}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your user ID is: <code className="font-code text-sm bg-muted p-1 rounded-sm">{user.uid}</code></p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-8">
                   <Card>
                      <CardHeader>
                        <CardTitle>Sign In or Create Account</CardTitle>
                        <CardDescription>
                          Join the Moonbug community to personalize your experience.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         {userError && (
                            <Alert variant="destructive">
                              <AlertTitle>Authentication Error</AlertTitle>
                              <AlertDescription>{userError.message}</AlertDescription>
                            </Alert>
                         )}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="you@moonbug.app" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex-col sm:flex-row gap-2">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sign In
                        </Button>
                         <Button
                          variant="secondary"
                          onClick={form.handleSubmit(handleSignUp)}
                          disabled={isLoading}
                          className="w-full sm:w-auto"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sign Up
                        </Button>
                      </CardFooter>
                   </Card>
                </form>
              </Form>
            </div>
             <div className="md:col-span-2">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  <Button variant="outline" onClick={handleAnonymousSignIn} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue as Guest
                  </Button>
                   <p className="text-xs text-muted-foreground text-center">
                    As a guest, your data will be stored locally on this device and may be lost.
                  </p>
                </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
