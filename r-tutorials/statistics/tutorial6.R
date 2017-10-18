# Project:    Code for Tutorial 6 (PS 155)
# Date:       2014-10-30
# Author:     Simon Ejdemyr 

#--------------------------------------------------------------
# Preliminaries 

# Load packages
libs <- c("plyr", "dplyr", "ggplot2", "arm")
sapply(libs, require, character.only = TRUE)


# Load data 
setwd("~/dropbox/155/tutorial2")
system("unzip ANEScumul_data_codebook.zip")                
anes <- read.dta("anescum.dta", warn.missing.labels = F)   
system("rm -r anescum* __M*")                              


# Keep only some variables and rename
anes <- anes %>%
        select(VCF0004, VCF0101, VCF0104, VCF0106, VCF0140, VCF0113,
               VCF0114, VCF0301, VCF0310, VCF0604, VCF0838, VCF0218) %>%
        rename(c(VCF0004 = "year",
                 VCF0101 = "age",
                 VCF0104 = "gender",
                 VCF0106 = "race",
                 VCF0140 = "edu",
                 VCF0113 = "south",
                 VCF0114 = "income",
                 VCF0301 = "partyid",
                 VCF0310 = "interest",
                 VCF0604 = "govtrust",
                 VCF0838 = "abortion",
                 VCF0218 = "demtherm"))


dim(anes)


#--------------------------------------------------------------
# Model 1: demtherm v gender in 2008 
levels(anes$gender) <- c(NA, "Male", "Female")

lm1 <- lm(demtherm ~ gender, data = anes)

require(arm)  
display(lm1)


# Two ways to graphically display results:

# (1) 
ci1 <- coef(lm1)[2] + c(-1, 1) * se.coef(lm1)[2] * 1.96
ci1 <- confint(lm1, level = 0.95)[2, ]

est1 <- data.frame(est = coef(lm1)[2],
                   lb = ci1[1],
                   ub = ci1[2], 
                   model = "Model 1")

ggplot(est1, aes(x = model, y = est)) +
    geom_point() +
    geom_errorbar(aes(ymin = lb, ymax = ub), width = 0.1) +
    geom_hline(yintercept = 0, lty = 2, color = "red") +
    xlab("") +
    ylab("Female Democrat Thermometer Estimate (Relative to Males)")


# (2) 
pred1 <- predict(lm1,
                 newdata = data.frame(gender = c("Male", "Female")),
                 se.fit = T,
                 interval = "confidence")

pred1 <- data.frame(pred1$fit, gender = c("Male", "Female"))

ggplot(pred1, aes(x = gender, y = fit, color = gender)) +
    geom_point() +
    geom_errorbar(aes(ymin = lwr, ymax = upr), width = 0.1) +
    xlab("") +
    ylab("Predicted Democrat Thermometer")



#--------------------------------------------------------------
# Model 2: add control for income and age
levels(anes$income)[1] <- NA
levels(anes$income) <- with(anes, substr(levels(income), 4, nchar(levels(income))))
anes$age[anes$age == 0] <- NA


lm2 <- lm(demtherm ~ gender + age + income, data = anes)

display(lm2)


# (1) 
ci2 <- confint(lm2, level = 0.95)[2, ] 

est2 <- data.frame(est = coef(lm2)[2],
                   lb = ci2[1],
                   ub = ci2[2], 
                   model = "Model 2")         

est <- rbind(est1, est2)

ggplot(est, aes(x = model, y = est)) +
    geom_point() +
    geom_errorbar(aes(ymin = lb, ymax = ub), width = 0.1) +
    geom_hline(yintercept = 0, lty = 2, color = "red") +
    xlab("") +
    ylab("Female Democrat Thermometer Estimate (Relative to Males)")


# (2)
newdta <- data.frame(gender = c("Male", "Female"),
                     age = mean(anes$age, na.rm = T), 
                     income = "34 to 67 percentile")

pred2 <- predict(lm2,
                 newdata = newdta,
                 se.fit = T,
                 interval = "confidence")

pred2 <- data.frame(pred2$fit, gender = c("Male", "Female"))

ggplot(pred2, aes(x = gender, y = fit, color = gender)) +
    geom_point() +
    geom_errorbar(aes(ymin = lwr, ymax = upr), width = 0.1) +
    xlab("\nNote: Estimates condition on income and age") +
    ylab("Predicted Democrat Thermometer")


#--------------------------------------------------------------
# Model 3: Relationship over time
anes_sub <- subset(anes, year >= 1978 & year != 2002)

lm3 <- dlply(anes_sub, .(year), function(x) {
    lm(demtherm ~ gender + age + income, data = x)
})

display(lm3$"1990")


# (1) 
est_time <- ldply(lm3, function(x) {
    c(coef(x)[2], confint(x)[2, ])
})

names(est_time) <- c("year", "est", "lb", "ub")


ggplot(est_time, aes(x = year, y = est)) +
    geom_point() +
    geom_errorbar(aes(ymin = lb, ymax = ub), width = 0.3) +
    geom_hline(yintercept = 0, lty = 2, color = "red") +
    xlab("") +
    ylab("Female Democrat Thermometer Estimate (Relative to Males)")


# (2)
pred_time <- ldply(lm3, function(x) {
    predict(x, newdata = newdta, se.fit = T, interval = "confidence")$fit
})

pred_time$gender <- rep(c("Male", "Female"), 13)


ggplot(pred_time, aes(x = year, y = fit, color = gender)) +
    geom_point() +
    geom_line() +
    geom_ribbon(aes(ymax = upr, ymin = lwr, fill = gender),
                    alpha = 0.15, color = NA) + 
    xlab("\nNote: Estimates condition on income and age") +
    ylab("Predicted Democrat Thermometer")


#--------------------------------------------------------------
# Model 4: Interactions
lm4 <- lm(demtherm ~ gender + age + income + age:gender, data = anes)
display(lm4)

agerange <- 18:85
newdta <- data.frame(expand.grid(gender = c("Male", "Female"),
                                 age = agerange), 
                     income = "34 to 67 percentile")

pred4 <- predict(lm4,
                 newdata = newdta,
                 se.fit = T,
                 interval = "confidence")

pred4 <- data.frame(cbind(pred4$fit, newdta))

head(pred4)

ggplot(pred4, aes(x = age, y = fit, color = gender)) +
    geom_point() +
    geom_line(aes(y = lwr), lty = 3) +
    geom_line(aes(y = upr), lty = 3) + 
    ylab("Democrat Thermometer Ratings") +
    xlab("Age")


# Relax linearity assumption on age
anes_sub <- subset(anes, age %in% 20:70)
anes_sub$age_cat <- cut(anes_sub$age, breaks = seq(20, 70, by = 5))

head(anes_sub)


lm5 <- lm(demtherm ~ gender + income + age_cat + + age_cat:gender,
          data = anes_sub)

display(lm5)


agerange <- sort(as.character(unique(na.omit(anes_sub$age_cat))))
newdta <- data.frame(expand.grid(gender = c("Male", "Female"),
                                 age_cat = agerange), 
                     income = "34 to 67 percentile")

pred5 <- predict(lm5,
                 newdata = newdta,
                 se.fit = T,
                 interval = "confidence")

pred5 <- data.frame(cbind(pred5$fit, newdta))

ggplot(pred5, aes(x = age_cat, y = fit, color = gender)) +
    geom_point() +
    geom_line(aes(y = lwr, group = gender), lty = 3) +
    geom_line(aes(y = upr, group = gender), lty = 3) +
    geom_line(aes(y = fit, group = gender), lty = 1, alpha = 0.5) + 
    ylab("Democrat Thermometer Ratings") +
    xlab("Age Category") +
    theme_bw()








