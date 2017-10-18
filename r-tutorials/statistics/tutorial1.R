# Project:     Code for Tutorial 1 (PS 155)
# Date:        2014-09-25


#=====================================
# DATA STRUCTURES 
#=====================================
# Scalars & Strings		

# Scalars 
a <- 9	
b <- a + 1		
b <- b - a	

# String	
c <- "Hello world"	
	
class(a)	
class(c)	

v <- c(1, 2, 3)

v[v > 1]

seq(0, 100, length.out = 11)

	
#=====================================	
# Vectors  	

# Basic examples 
v <- c(1, 2, 3, 4)		
v <- 1:4		
v <- seq(from = 0, to = 0.5, by = 0.1)		

# length() and mean()	
length(v)   	
mean(v)     	

# Vectors with strings 	
v_colors <- c("blue", "yellow", "light green")	
v_colors	

# Indexing/reassigning elements 
v_colors[2]         
v_colors[c(1, 3)]   

v_colors[2:3]  <- c("red", "purple")	
v_colors 	
	
#=====================================	
# Data Frames

# DF with Harry Potter characters
name <- c("Harry", "Ron", "Hermione", "Hagrid", "Voldemort")	
height <- c(176, 175, 167, 230, 180)	
gpa <- c(3.4, 2.8, 4.0, 2.2, 3.4)	
df_students <- data.frame(name, height, gpa)  		
df_students	

# Alternative way of creating DF
df_students <- data.frame(name = c("Harry", "Ron", "Hermione", "Hagrid",
                                   "Voldemort"), 	
                          height = c(176, 175, 167, 230, 180), 	
                          gpa = c(3.4, 2.8, 4.0, 2.2, 3.4))	
df_students	

# Adding variable
df_students$good <- c(1, 1, 1, 1, 0)   	
df_students	

# Features of the DF
dim(df_students)  		
df_students[2, 3]               #Ron's GPA		
df_students$gpa[2]              #Ron's GPA	

df_students[5, ]                #get row 5
df_students[3:5, ]              #get rows 3-5
	
df_students[, 2]                #get column 2 (height)	
df_students$height              #get column 2 (height) 
df_students[, 1:3]              #get columns 1-3 


df_students[4, 2] <- 255        #reassign Hagrid's height	
df_students$height[4] <- 255    #same thing as above	
df_students	
	

#=====================================
# READING DATA
#=====================================

setwd("~/dropbox/155/tutorial1")		
world <- read.csv("world_small.csv")	
	
dim(world)	
head(world)        	
summary(world)	

#=====================================
# INSTALLING & LOADING PACKAGES
#=====================================
# Installing packages 
install.packages("plyr", dep = T)
install.packages(c("dplyr", "ggplot2"), dep = T)

# Loading packages 
require(plyr)	
require(dplyr)	
require(ggplot2)	
	
sapply(c("plyr", "dplyr", "ggplot2"), require, character.only = T)	


#=====================================
# BASIC DATA MANIPULATION
#=====================================
setwd("~/dropbox/155/tutorial1")	
world <- read.csv("world_small.csv")

#=====================================
# Subsets 
afr1 <- world[world$region == "Africa", ]   #option 1: use brackets 		
afr1 <- subset(world, region == "Africa")   #option 2: use subset()		
afr1 <- filter(world, region == "Africa")   #option 3: use filter() from dplyr	
	
	
afr2 <- world[world$region == "Africa" & world$polityIV >= 15, ]         	
afr2 <- subset(world, region == "Africa" & polityIV >= 15)          	
afr2 <- filter(world, region == "Africa", polityIV >= 15)           	

 	
afr3 <- world[world$region == "Africa" & world$polityIV >= 15, c(1, 4)]  	
afr3 <- subset(world, region == "Africa" & polityIV >= 15,               	
               select = c("country", "polityIV")) 	
afr3 <- filter(world, region == "Africa", polityIV >= 15) %>%        	
        select(country, polityIV)	

#=====================================
# Adding new variables 
world$gdp_log <- log(world$gdppcap08)             	
world$democ <- ifelse(world$polityIV > 10, 1, 0)  	
head(world)	
	
world <- mutate(world, gdp_log = log(gdppcap08), 	
                       democ = ifelse(polityIV > 10, 1, 0))	
head(world)	

# Factor variables 
class(world$region)	
levels(world$region)	

world$region2 <- world$region         
levels(world$region2) <- c("Africa", "Asia-Pacific", "Europe", "Middle East", 	
                           "N. America", "S. America", "Europe", "Europe")    
table(world$region); table(world$region2)               

#=====================================
# Sorting 		
head(world)                                  #original order	
world <- arrange(world, gdppcap08)           #order by gdp per cap	
world <- arrange(world, desc(gdppcap08))     #order by gdp per cap (descending)
world <- arrange(world, region, country)     #order by region, then country	
	
#=====================================	
# Combining Tasks with Piping 		
samr <- world %>%                        	
        filter(region == "S. America", polityIV > 10) %>%   	
        mutate(gdp_log = log(gdppcap08),                   	
               democ = ifelse(polityIV > 10, 1, 0)) %>% 	
        select(country, gdppcap08, gdp_log, democ) %>%     	
        arrange(desc(gdp_log))                        	
samr	

# Vector for trouble shooting exercise 
x <- sample(c(rep(NA, 200), runif(800)), 500)	

