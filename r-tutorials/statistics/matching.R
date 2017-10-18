library(MatchIt)
library(dplyr)
library(ggplot2)

setwd("path/to/dir")
ecls <- read.csv("ecls.csv")


# Pre-analysis using non-matched data
ecls %>%
  group_by(catholic) %>%
  summarise(n_students = n(),
            mean_math = mean(c5r2mtsc_std),
            std_error = sd(c5r2mtsc_std) / sqrt(n_students))


ecls %>%
  mutate(test = (c5r2mtsc - mean(c5r2mtsc)) / sd(c5r2mtsc)) %>% #this is how the math score is standardized
  group_by(catholic) %>%
  summarise(mean_math = mean(test))

with(ecls, t.test(c5r2mtsc_std ~ catholic))

# Difference-in-means: pre-treatment covariates
ecls_cov <- c('race_white', 'p5hmage', 'w3income', 'p5numpla', 'w3momed_hsb')

ecls %>%
  group_by(catholic) %>%
  select(one_of(ecls_cov)) %>%
  summarise_all(funs(mean(., na.rm = T)))

lapply(ecls_cov, function(v) {
  t.test(ecls[, v] ~ ecls[, 'catholic'])
})


# Propensity score estimation
ecls <- ecls %>% mutate(w3income_1k = w3income / 1000)
m_ps <- glm(catholic ~ race_white + w3income_1k + p5hmage + p5numpla + w3momed_hsb,
            family = binomial(), data = ecls)
summary(m_ps)

prs_df <- data.frame(pr_score = predict(m_ps, type = "response"),
                     catholic = m_ps$model$catholic)

labs <- paste("Actual school type attended:", c("Catholic", "Public"))
prs_df %>%
  mutate(catholic = ifelse(catholic == 1, labs[1], labs[2])) %>%
  ggplot(aes(x = pr_score)) +
  geom_histogram(color = "white") +
  facet_wrap(~catholic) +
  xlab("Probability of going to Catholic school") +
  theme_bw()


# Executing a matching algorithm
ecls_nomiss <- ecls %>%  # MatchIt does not allow missing values
  select(c5r2mtsc_std, catholic, one_of(ecls_cov)) %>%
  na.omit()

mod_match <- matchit(catholic ~ race_white + w3income + p5hmage + p5numpla + w3momed_hsb,
                     method = "nearest", data = ecls_nomiss)
dta_m <- match.data(mod_match)
dim(dta_m)

fn_bal <- function(dta, variable) {
  dta$variable <- dta[, variable]
  dta$catholic <- as.factor(dta$catholic)
  ggplot(dta, aes(x = distance, y = variable, color = catholic)) +
    geom_point(alpha = 0.2, size = 1.5) +
    geom_smooth(method = "loess", se = F) +
    xlab("Propensity score") +
    ylab(variable) +
    theme_bw()
}


# Checking balance
library(gridExtra)
grid.arrange(
   fn_bal(dta_m, "w3income"),
   fn_bal(dta_m, "p5numpla") + theme(legend.position = "none"),
   fn_bal(dta_m, "p5hmage"),
   fn_bal(dta_m, "w3momed_hsb") + theme(legend.position = "none"),
   fn_bal(dta_m, "race_white"),
   nrow = 3, widths = c(1, 0.85)
)

dta_m %>%
    group_by(catholic) %>%
    summarise_all(funs(mean))


# Estimating treatment effects
with(dta_m, t.test(c5r2mtsc_std ~ catholic))

lm_treat1 <- lm(c5r2mtsc_std ~ catholic, data = dta_m)
summary(lm_treat1)

lm_treat2 <- lm(c5r2mtsc_std ~ catholic + race_white + p5hmage +
                  I(w3income / 10^3) + p5numpla + w3momed_hsb, data = dta_m)
summary(lm_treat2)
