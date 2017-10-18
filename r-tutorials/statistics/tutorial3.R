# Project:    Code for Tutorial 3 (PS 155)
# Date:       2014-10-08
# Author:     Simon Ejdemyr 

setwd("~/dropbox/155/tutorial3")

#===========================
# More on For Loops
dat <- read.csv("nesexample2.csv")
head(dat)

years <- sort(unique(dat$year))
years

l <- list()
n <- length(years)
for(i in 1:n){
    l[[i]] <- subset(dat, year == years[i])
}

lapply(l, dim)


#===========================
# Sample Means and Coverage Probability

# Read the data 
dat <- read.csv("nesexample2.csv")
head(dat)

# Let's work with the democratic feeling thermometer
summary(dat$therm.dems)
thd <- na.omit(dat$therm.dems)

# We're taking the mean of this variable as the "true" mean in the population
mean(thd)

# Let's see how often a sample size of 900 alllows us to estimate this mean
n <- 900                      

# Generate a sample and calculate the sample mean 
smpl <- sample(thd, n)        
mean(smpl)                    

# In this class example let's calculate 75% confidence intervals
std.err <- function(x) sd(x) / sqrt(length(x))
z <- qnorm(0.875)                        #find z-score 
mean(smpl) - z * std.err(smpl)           #lower CI
mean(smpl) + z * std.err(smpl)           #upper CI


#===========================
# Writing functions
std.err <- function(x) sd(x) / sqrt(length(x))
std.err(thd)
std.err(dat$therm.dems)        #doesn't work

std.err2 <- function(x) sd(x, na.rm = T) / sqrt(na.omit(length(x)))
std.err2(dat$therm.dems)

covar <- function(x, y) {
    df <- na.omit(data.frame(x, y))
    X <- df[, 1]
    Y <- df[, 2]
    covariance <- (1 / (length(X) - 1)) * sum((X - mean(X)) * (Y - mean(Y)))
    return(covariance)
}

covar(dat$therm.unions, dat$therm.dems)
cov(dat$therm.unions, dat$therm.dems, use = "complete")

length(dat$therm.dems)
