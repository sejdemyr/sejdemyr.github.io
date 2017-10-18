
# Script that illustrates how to measure segregation and various
# issues that may arise 


#---------------------------------------------------------------------------
# Preliminaries 

# Load packages (use install.packages(...) if you don't have these) 
pkgs <- c("ggplot2", "gridExtra", "grid", "RColorBrewer", "rgdal", "rgeos", 
          "maptools", "seg", "splancs", "dplyr")
sapply(pkgs, require, character.only = TRUE)

# Set ggplot theme
theme <- theme_bw() + theme(
    panel.grid.major = element_blank(), 
    panel.grid.minor = element_blank(), 
    panel.border = element_blank(), 
    axis.ticks = element_blank(), 
    axis.text = element_blank(), 
    strip.background = element_blank(),
    strip.text.x = element_text(size = 10)
    ) 



#---------------------------------------------------------------------------
# Generate data for six hypothetical cities 
# Set number of members of each group
g1 <- 1000
g2 <- 1000

# Data for three segregated cities 
dta.seg1 <- data.frame(
    id = 1:no.loc, 
    group1 = c(rep(g1 / (no.loc/2), no.loc/2), rep(0, no.loc/2)),
    group2 = c(rep(0, no.loc/2), rep(rep(g2 / (no.loc/2), no.loc/2))),
    j = "(a)"
    )

dta.seg2 <- data.frame(
    id = 1:no.loc, 
    group1 = c(rep(g1 / (no.loc/4), no.loc/4), rep(0, no.loc * 3/4)),
    group2 = c(rep(0, no.loc/2), rep(rep(g2 / (no.loc/2), no.loc/2))),
    j = "(b)"
    )

dta.seg3 <- data.frame(
    id = 1:no.loc, 
    group1 = c(rep(0, no.loc * 1/4), rep(g1 / (no.loc/4), no.loc/4), rep(0, no.loc / 2)),
    group2 = c(rep(0, no.loc/2), rep(rep(g2 / (no.loc/2), no.loc/2))),
    j = "(c)"
    )

# Integrated city 
dta.int <- data.frame(
    id = 1:no.loc, 
    group1 = rep(g1 / no.loc, no.loc),  
    group2 = rep(g2 / no.loc, no.loc),
    j = "(d)"
    )

# Two checkerboard cities 
dta.cb1 <- data.frame(
    id = 1:no.loc, 
    group1 = rep(c(g1 / (no.loc/2), 0), no.loc/2),  
    group2 = rep(c(0, g2 / (no.loc/2)), no.loc/2),
    j = "(e)"
    )

dta.cb1$group1[c(5:8, 13:16)] <- dta.cb1$group1[c(2:5, 2:5)]
dta.cb1$group2[c(5:8, 13:16)] <- dta.cb1$group2[c(2:5, 2:5)]

dta.cb2 <- dta.cb1 %>% mutate(id = ids, j = "(f)") 
dta.cb2.collapse <- dta.cb2 %>% group_by(id) %>% select(-j) %>% summarise_each(funs(sum)) %>% mutate(j = "(f)")


# Plot
dta.list <- list(dta.seg1, dta.seg2, dta.seg3, dta.int, dta.cb1, dta.cb2)
plots <- lapply(dta.list, function(dta) {

    g1 <- dotsInPolys(grd.sp, as.integer(dta$group1))
    g2 <- dotsInPolys(grd.sp, as.integer(dta$group2))

    points <- rbind(data.frame(coordinates(g1), group = "group 1"),
                    data.frame(coordinates(g2), group = "group 2"))

	if(length(unique(dta$id)) < no.loc) polyg <- polyg2

    ggplot(data = polyg, aes(x = long, y = lat)) + 
        geom_polygon(aes(group = id), color = "black", fill = "white", size = 1.1) +
        geom_point(data = points, aes(x = x, y = y, color = group, shape = group), size = 1.4) +
        scale_color_manual(values = c("black", "#1f78b4"), guide = F) +
        scale_shape_manual(values = c(16, 0), guide = F) +
	    coord_equal() +
		labs(x = NULL, y = NULL) + 
        ggtitle(as.character(dta$j[1])) +
        theme 
})

do.call(grid.arrange, c(plots, nrow = 2))


#---------------------------------------------------------------------------
# Calculate level of segregation for each 

# Function that takes a spatial polygons object, data, the column names
# for two groups, and bandwidth and calculates three segregation measures
# for a given city 
calculate_seg <- function(polyg, dta, gr1, gr2, bandwidth) {
    
    # Subset the data to the groups of interest 
    dta.sub <- dta[, c(gr1, gr2)]

    # Find non-spatial dissimilarity index using 'dissim' from pkg 'seg'
    dis.nspat <- dissim(data = dta.sub)$d
    
    # Find two spatial segregation measures
    sp.seg <- spseg(polyg, dta.sub, smoothing = "kernel", sigma = bandwidth)
    
    dis.kern <- round(as.list(sp.seg)$d, 3)       #dissimilarity 
    inf.kern <- round(as.list(sp.seg)$h, 3)       #information theory 

    data.frame(
        city = dta$j[1], 
        measure = c("Non-Spatial Dissimilarity", "Spatial Dissimilarity", "Spatial Information Theory"),
        bandwidth = c(NA, rep(bandwidth, 2)),
        value = c(dis.nspat, dis.kern, inf.kern)
		)       
}

# Test: 
calculate_seg(grd.sp, dta.seg1, "group1", "group2", 0.5)

# Calculate for each city and graph result
dta.list <- list(dta.seg1, dta.seg2, dta.seg3, dta.int, dta.cb1, dta.cb2)
p <- lapply(dta.list, function(dta) {

    g1 <- dotsInPolys(grd.sp, as.integer(dta$group1))
    g2 <- dotsInPolys(grd.sp, as.integer(dta$group2))

    points <- rbind(data.frame(coordinates(g1), group = "group 1"),
                    data.frame(coordinates(g2), group = "group 2"))

    dta2 <- dta 
    if(length(unique(dta$id)) < no.loc) {
        polyg <- polyg2
        grd.sp <- grd.sp2
        dta2 <- dta.cb2.collapse
    }
    
    g1 <- ggplot(data = polyg, aes(x = long, y = lat)) + 
        geom_polygon(aes(group = id), color = "black", fill = "white", size = 1.1) +
        geom_point(data = points, aes(x = x, y = y, color = group, shape = group)) +
        scale_color_manual(values = c("black", "#1f78b4"), guide = F) +
        scale_shape_manual(values = c(16, 0), guide = F) +        
        ylab("") +
        xlab("") +
        ggtitle(as.character(dta$j[1])) +
        coord_equal() +         
        theme +
		theme(plot.margin=unit(c(0,0,-0.5,0), "cm"))

    seg <- rbind(calculate_seg(grd.sp, dta2, "group1", "group2", 0.2),
	             calculate_seg(grd.sp, dta2, "group1", "group2", 0.7)[-c(1), ])
    g2 <- tableGrob(seg, rows = rep("", 5))

    arrangeGrob(g1, g2, ncol = 1, heights = c(0.7, 0.3))
})

# Test (plot just one city):
grid.newpage()
grid.draw(p[[1]])

# Plot all cities: 
plots <- arrangeGrob(p[[1]], p[[2]], p[[3]], p[[4]], p[[5]], p[[6]], nrow = 2)
grid.newpage()
grid.draw(plots)


