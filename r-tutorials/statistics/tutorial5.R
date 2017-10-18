# Project:    Code for Tutorial 5 (PS 155)
# Date:       2014-10-23
# Author:     Simon Ejdemyr 

setwd("~/dropbox/155/tutorial5")

#===========================
# Merging
#===========================

# Toy datasets 1:
demo <- data.frame(country = c("USA", "Albania", "Turkey", "China", "Sudan"),
                   democracy_score = c(19, 16, 16, 5, 10))
demo
econ <- data.frame(country = c("China", "Albania", "Turkey", "USA", "Sudan"),
                   gdp_pc = c(12000, 10000, 9000, 20000, 500))
econ


merge(demo, econ, by = "country")


# Toy datasets 2:
demo <- data.frame(expand.grid(country = c("USA", "China", "Sudan"),
                               year = 1994:1996),
                   democracy_score = round(runif(9, 0, 20), 0))

econ <- data.frame(expand.grid(year = 1994:1996,
                               country = c("USA", "China", "Sudan")),
                   gdp_pc = round(runif(9, 1000, 20000), 0))
demo; econ

merge(demo, econ, by = c("country", "year"))


#===========================
# Appending 
#===========================

df1 <- data.frame(year = rep(1990:1995, 2),
                  country = c(rep("country1", 6), rep("country2", 6)))
df2 <- data.frame(year = rep(1996:2000, 2),
                  country = c(rep("country1", 5), rep("country2", 5)))

df <- rbind(df1, df2)

require(dplyr)
arrange(df, country, year)












