
# Prepare data inputs for map: estimates and deaths, rates of decline, and
# various projection scenarios

# Load libraries
library(plyr)
library(dplyr) 

# Set working directory with input csv files 
setwd("~/dropbox/data-visualization/8-map/input")

# Load data
est <- read.csv("all-estimates-deaths-20150720.csv")
decl <- read.csv("rates-of-decline-country-summary.csv")
proj <- lapply(dir()[grepl("projections", dir())], function(csv) read.csv(csv))

# Clean estimates file
est <- est %>% select(CountryName, ISO3Code, u5mr = U5MR.2015, imr = IMR.2015,
                      nmr = NMR.2015, u5deaths = Under.five.Deaths.2015,
                      infdeaths = Infant.Deaths.2015, neodeaths = Neonatal.Deaths.2015)

# Clean rates of declines file
decl <- decl %>% select(ISO3Code, arr9015 = ARR.1990.2015.median,
                        arr9000 = ARR.1990.2000.median, arr0015 = ARR.2000.2015.median)

# Clean projection files
proj <- lapply(proj, function(dta) select(dta, ISO3Code, U5MR.2030, Under.five.Deaths.2030))
proj[[1]] <- rename(proj[[1]], u5mrc = U5MR.2030, u5dc = Under.five.Deaths.2030)
proj[[2]] <- rename(proj[[2]], u5mrt = U5MR.2030, u5dt = Under.five.Deaths.2030)
proj[[3]] <- rename(proj[[3]], u5mrr = U5MR.2030, u5dr = Under.five.Deaths.2030)

proj <- Reduce(function(...) merge(..., all = T), proj)

# Merge three data sources
result <- merge(est, decl, by = "ISO3Code")
result <- merge(result, proj, by = "ISO3Code")

# Rename to official country names
source("../code/recode-to-official-names.R")
result <- recodeToOfficial(result, "CountryName")


# Write resulting file
# write.csv(result, "mortalitydta.csv", row.names = F)

# Write only some variables
result_small <- result %>% select(ISO3Code, CountryName, u5mr, u5deaths, arr9015, u5mrproj = u5mrt, u5dproj = u5dt)
write.csv(result_small, "mortalitydta.csv", row.names = F)

getwd()

head(result_small)







