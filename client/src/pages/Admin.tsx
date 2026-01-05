import { useState } from "react";
import { Layout } from "@/components/layout";
import { useQuotes, useCreateQuote, useDeleteQuote } from "@/hooks/use-quotes";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Loader2, Trash2, Plus, Quote as QuoteIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Admin() {
  const { data: quotes, isLoading } = useQuotes();
  const createQuote = useCreateQuote();
  const deleteQuote = useDeleteQuote();
  
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !date) return;

    createQuote.mutate({
      content,
      displayDate: format(date, "yyyy-MM-dd"),
    }, {
      onSuccess: () => {
        setContent("");
        setDate(new Date());
      }
    });
  };

  const sortedQuotes = quotes?.sort((a, b) => 
    new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime()
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Content Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your daily quotes and schedule.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[350px,1fr]">
          {/* Create Form */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle>New Entry</CardTitle>
                <CardDescription>Schedule a new quote for the feed.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Publish Date</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d);
                            setIsCalendarOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Quote Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Type something funny or inspiring..."
                      className="min-h-[150px] resize-none text-base leading-relaxed p-4"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 font-semibold" 
                    disabled={createQuote.isPending || !content || !date}
                  >
                    {createQuote.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Quote
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-display">Scheduled Items</h2>
              <div className="text-sm text-muted-foreground">
                {quotes?.length || 0} total entries
              </div>
            </div>
            
            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : sortedQuotes?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-xl border-muted bg-muted/20">
                <QuoteIcon className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No quotes yet</h3>
                <p className="text-sm text-muted-foreground/80 max-w-xs mt-1">
                  Create your first quote using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {sortedQuotes?.map((quote) => {
                    const isDeleting = deleteQuote.isPending && deleteQuote.variables === quote.id;
                    const isFuture = new Date(quote.displayDate) > new Date();

                    return (
                      <motion.div
                        key={quote.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "group relative flex flex-col gap-3 rounded-xl border p-5 bg-card hover:shadow-md transition-all duration-200",
                          isDeleting && "opacity-50 pointer-events-none"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full font-medium text-xs",
                              isFuture 
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            )}>
                              {isFuture ? "Scheduled" : "Published"}
                            </span>
                            <span className="text-muted-foreground font-medium">
                              {format(new Date(quote.displayDate), "EEEE, MMMM do, yyyy")}
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteQuote.mutate(quote.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-lg font-serif leading-relaxed text-foreground/90 whitespace-pre-wrap">
                          {quote.content}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
