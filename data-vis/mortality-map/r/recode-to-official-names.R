
library(plyr)
library(dplyr)

recodeToOfficial <- function(data, Name.Country.Var) {

    data <- plyr::rename(data,replace = setNames("Country.Name", Name.Country.Var))

    data$Country.Name <- gsub("&", "and", data$Country.Name)

    data$Country.Name[data$Country.Name=="Brunei"] <- "Brunei Darussalam"

    data$Country.Name[data$Country.Name=="Bolivia"] <- "Bolivia (Plurinational State of)"

    data$Country.Name[data$Country.Name=="Cape Verde"] <- "Cabo Verde"

    data$Country.Name[data$Country.Name=="Cote d Ivoire"] <- "Cote d'Ivoire"

    data$Country.Name[data$Country.Name=="Congo DR"] <- "Democratic Republic of the Congo"

    data$Country.Name[data$Country.Name=="Federated States of Micronesia"] <- "Micronesia (Federated States of)"

    data$Country.Name[data$Country.Name=="Gambia The"] <- "Gambia"

    data$Country.Name[data$Country.Name=="Iran"] <- "Iran (Islamic Republic of)"

    data$Country.Name[data$Country.Name=="Korea Rep"] <- "Republic of Korea"

    data$Country.Name[data$Country.Name=="Lao PDR"] <- "Lao People's Democratic Republic"

    data$Country.Name[data$Country.Name=="Moldova"] <- "Republic of Moldova"

    data$Country.Name[data$Country.Name=="Macedonia"] <- "The former Yugoslav Republic of Macedonia"

    data$Country.Name[data$Country.Name=="Korea DPR"] <- "Democratic People's Republic of Korea"

    data$Country.Name[data$Country.Name=="St Vincent and the Grenadines"] <- "Saint Vincent and the Grenadines"

    data$Country.Name[data$Country.Name=="Syria"] <- "Syrian Arab Republic"

    data$Country.Name[data$Country.Name=="Timor Leste"] <- "Timor-Leste"

    data$Country.Name[data$Country.Name=="Tanzania"] <- "United Republic of Tanzania"

    data$Country.Name[data$Country.Name=="United States of America"] <- "United States"

    data$Country.Name[data$Country.Name=="Venezuela"] <- "Venezuela (Bolivarian Republic of)"

    data$Country.Name[data$Country.Name=="Vietnam"] <- "Viet Nam"

    data <- plyr::rename(data,replace = setNames(Name.Country.Var, "Country.Name"))
    
    return(data)

}
