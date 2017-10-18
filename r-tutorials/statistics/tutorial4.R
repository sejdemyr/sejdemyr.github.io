# Project:    Code for Tutorial 4 (PS 155)
# Date:       2014-10-16
# Author:     Simon Ejdemyr 

setwd("~/dropbox/155/tutorial4")

#===========================
# Tables and Graphs
#===========================

states <- read.csv("states.csv")


#===========================
# Tables: Example 1
t <- with(states, table(south, gb_win00))
t <- prop.table(t, margin = 1)
t                                   
         
write.table(t, file = "bush_south.txt", sep = ",", quote = FALSE)


#===========================
# Tables: Example 2

# Keep 5 variables
states_sub <- select(states, blkpct, attend_pct, bush00, obama08, womleg)

# Find summary statistics for each variable
library(plyr)                            
means <- colwise(mean)(states_sub)
stdev <- colwise(sd)(states_sub)
mins <- colwise(min)(states_sub)
maxs <- colwise(max)(states_sub)

# Create df with summary statistics (putting variables in rows using transpose)
df <- data.frame(t(means),
                 t(stdev),
                 t(mins),
                 t(maxs))

# Clean column and row names
names(df) <- c("Mean", "SD", "Min", "Max")
row.names(df) <- c("Black (%)", "Attend Church (%)", "Bush -00 (%)",
                   "Obama -08 (%)", "Women in Legislature (%)")

# Restrict number of decimal points to 1
df <- round(df, 1)
df

# Write data frame to .txt file
write.table(df, file = "sumstats.txt", sep = ",", quote = FALSE)


#===========================
# Graphs: Saving as .pdf
library(ggplot2)

p <- ggplot(states, aes(x = attend_pct, y = bush00)) +
       geom_point() +
       geom_text(aes(label = stateid, y = bush00 - 0.7), size = 3) +
       geom_smooth(method = "loess", se = F) +
       xlab("% in State Attending Religious Services") +
       ylab("% in State Voting for Bush in 2000")  

# Save p as .pdf
pdf(file = "~/Desktop/bush_religion.pdf", height = 6, width = 8)
p
dev.off()

pdf(file = "~/Desktop/bush_religion2.pdf", height = 6, width = 8)
ggplot(states, aes(x = attend_pct, y = bush00)) +
       geom_point() +
       geom_text(aes(label = stateid, y = bush00 - 0.7), size = 3) +
       geom_smooth(method = "loess", se = F) +
       xlab("% in State Attending Religious Services") +
       ylab("% in State Voting for Bush in 2000")
dev.off()


#===========================
# Arranging Graphs 
p1 <- ggplot(states, aes(x = bush00, y = bush04)) +
        geom_point() +
        geom_text(aes(label = stateid, y = bush04 - 0.7), size = 3) +
        geom_smooth(method = "loess", se = F) +
        xlab("% in State Voting for Bush in 2000") +
        ylab("% in State Voting for Bush in 2004")  

p2 <- ggplot(states, aes(x = bush04, y = obama08)) +
        geom_point() +
        geom_text(aes(label = stateid, y = obama08 - 0.7), size = 3) +
        geom_smooth(method = "loess", se = F) +
        xlab("% in State Voting for Bush in 2004") +
        ylab("% in State Voting for Obama in 2008")

p3 <- ggplot(states, aes(x = vep04_turnout, y = bush04)) +
        geom_point() +
        geom_text(aes(label = stateid, y = bush04 - 0.7), size = 3) +
        geom_smooth(method = "loess", se = F) +
        xlab("Turnout among Voting Eligible Population (2004)") +
        ylab("% in State Voting for Bush in 2004")

p4 <- ggplot(states, aes(x = vep08_turnout, y = obama08)) +
        geom_point() +
        geom_text(aes(label = stateid, y = obama08 - 0.7), size = 3) +
        geom_smooth(method = "loess", se = F) +
        xlab("Turnout among Voting Eligible Population (2008)") +
        ylab("% in State Voting for Obama in 2008")

library(gridExtra)

pdf(file = "~/Desktop/grid.pdf", height = 10, width = 10)
grid.arrange(p1, p2, p3, p4,
             ncol = 2)           
dev.off()


#===========================
# Hypothesis Testing
#===========================
head(states)

#===========================
# Chi-Squared Tests
with(states, table(gb_win00, states$gay_policy))

# Rearrange the order of the gay policy scale 
states$gay_policy <- factor(states$gay_policy,
                            levels = c("Most liberal", "Liberal",
                                       "Conservative", "Most conservative"))

with(states, table(gb_win00, states$gay_policy))

# Chi-squared test
t <- with(states, table(gb_win00, states$gay_policy))
chisq.test(t)


#===========================
# One-Sample t-Test
mean(states$prcapinc)
t.test(states$prcapinc, mu = 30000)


#===========================
# Two-Sample t-Test
ddply(states, .(south), summarise, mean(womleg))

with(states, t.test(womleg ~ south))








