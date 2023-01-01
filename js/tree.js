/**
 * Tree class.
 * @author zeleniy [zeleniy.spb@gmail.com]
 * @param {String} url
 * @constructor
 */
function Tree(url) {
    /**
     * Data url.
     * @member {String}
     */
    this.url = url;
    /**
     * Root node of the tree.
     * @member {Object}
     */
    this.root;
    /**
     * Tree collapse level.
     * @member {Integer}
     */
    this.cutOffDepth = -1;
    /**
     * Graph HTML container
     * @member {Selection}
     */
    this.container;
    /**
     * Graph SVG element.
     * @member {Selection}
     */
    this.svg;
    /**
     * Graph canvas.
     * @member {Selection}
     */
    this.canvas;
    /**
     * SVG element height.
     * @member {Number}
     */
    this.height;
    /**
     * Tree hierarchy height.
     * @member {Number[]}
     */
    this.heightHierarchy = [];
    /**
     * Tree hierarchy state.
     * @member {Number[]}
     */
    this.state = [];
    /**
     * Diagonal generator.
     * @member {Function}
     */
    this.diagonal = d3.svg.diagonal().projection(function(d) {
        return [d.y, d.x];
    });
    /**
     * SVG element width.
     * @member {Number}
     */
    this.width;
    /**
     * Label position.
     * @member {String}
     */
    this.labelPosition = "default";
    /**
     * Animation duration.
     * @member {Integer}
     */
    this.duration = 750;
    /**
     * Radial progress diagram inner radius.
     * @member {Number}
     */
    this.innerRadius = 40;
    /**
     * Radial progress diagram outer radius.
     * @member {Number}
     */
    this.outerRadius = 50;
    /**
     * Radial progress diagram inner font size coefficient.
     * @member {Number}
     */
    this.fontSizeCoef = 0.5;
    /**
     * Is graph rendered.
     * @member {Boolean}
     */
    this.isRendered = false;
    /**
     * Graph canvas margins.
     * @member {Object}
     */
    this.margin = {
        top : 20,
        right : 120,
        bottom : 20,
        left : 120
    }
}


/**
 * Set tree cutoff level/depth.
 * @param cutOffDepth
 * @returns {Tree}
 */
Tree.prototype.setCutOffDepth = function(cutOffDepth) {

    this.cutOffDepth = cutOffDepth;
    return this;
}


/**
 * Set animation duration time.
 * @param {Number} duration
 * @returns {Tree}
 */
Tree.prototype.setAnimationDuration = function(duration) {

    this.duration = duration;
    return this;
}


/**
 * Set canvas top margin.
 * @param {Number} margin
 * @returns {Tree}
 */
Tree.prototype.setTopMargin = function(margin) {

    this.margin.top = margin;
    return this;
}


/**
 * Set canvas right margin.
 * @param {Number} margin
 * @returns {Tree}
 */
Tree.prototype.setRightMargin = function(margin) {

    this.margin.right = margin;
    return this;
}


/**
 * Set canvas bottom margin.
 * @param {Number} margin
 * @returns {Tree}
 */
Tree.prototype.setBottomMargin = function(margin) {

    this.margin.bottom = margin;
    return this;
}


/**
 * Set canvas left margin.
 * @param {Number} margin
 * @returns {Tree}
 */
Tree.prototype.setLeftMargin = function(margin) {

    this.margin.left = margin;
    return this;
}


/**
 * Set radial progress diagram inner font size coefficient.
 * @param {Number} coef
 * @returns {Tree}
 */
Tree.prototype.setFontSizeCoef = function(coef) {

    this.fontSizeCoef = coef;
    return this;
}


/**
 * Set radial progress diagram inner radius.
 * @param innerRadius
 * @returns {Tree}
 */
Tree.prototype.setInnerRadius = function(innerRadius) {

    this.innerRadius = innerRadius;
    return this;
}


/**
 * Set radial progress diagram outer radius.
 * @param outerRadius
 * @returns {Tree}
 */
Tree.prototype.setOuterRadius = function(outerRadius) {

    this.outerRadius = outerRadius;
    return this;
}


/**
 * Set label position.
 * Available options are "top", "bottom" and default.
 * @param {String} labelPosition
 * @returns {Tree}
 */
Tree.prototype.setLabelPosition = function(labelPosition) {

    this.labelPosition = labelPosition;
    return this;
}


Tree.prototype.getCurrentDepth = function() {

    for (var i = 0; i < this.state.length; i ++) {
        if (this.state[i] == 0) {
            return -- i;
        }
    }

    return i;
}


Tree.prototype.getCurrentHeight = function() {

    var depth = this.getCurrentDepth();

    if (depth >= this.heightHierarchy.length) {
        return this.heightHierarchy[this.heightHierarchy.length - 1];
    } else {
        return this.heightHierarchy[depth];
    }
}


/**
 * Get radial progress color.
 * @param {Number} value
 * @returns {String}
 */
Tree.prototype.getColor = function(value) {

    if (value <= 33) {
        return "#d9534f";
    } else if (value <= 67) {
        return "#f0ad4e";
    } else {
        return "#5cb85c";
    }
}


/**
 * Initialize some important variables on first tree rendering.
 * @param {Object[]} nodes
 * @return void
 */
Tree.prototype.init = function(nodes) {
    /*
     * Get tree depth.
     */
    var maxDepth = d3.max(nodes, function(d) {
        return d.depth;
    })
    /*
     * Set up current depth for first time.
     */
    var currentDepth;
    if (this.cutOffDepth > -1 && this.cutOffDepth <= maxDepth) {
        currentDepth = this.cutOffDepth;
    } else {
        currentDepth = maxDepth;
    }
    /*
     * Initialize state variable.
     */
    for (var i = 0; i <= maxDepth; i ++) {
        this.state[i] = 0;
    }
    /*
     * Calculate amount of expanded nodes on each level.
     */
    nodes.forEach(function(node) {
        if (node.depth <= currentDepth) {
            this.state[node.depth] ++;
        }
    }, this)
}


/**
 * Update graph.
 * @param {Object} source
 */
Tree.prototype.update = function(source) {
    /*
     * Compute the new tree layout.
     */
    var nodes = this.tree.nodes(this.root);
    if (this.isRendered === false) {
        this.init(nodes);
    }
    /*
     * Resize canvas and its container using new height.
     */
    this.container
        .transition()
        .duration(this.duration)
        .style("height", this.getCurrentHeight() + this.margin.top + this.margin.bottom);
    this.svg
        .transition()
        .duration(this.duration)
        .attr("height", this.getCurrentHeight() + this.margin.top + this.margin.bottom);
    /*
     * Preprocess tree.
     */
    nodes = nodes.filter(function(d, i) {
        /*
         * Append identifiers to nodes.
         */
        d.id = d.id || ++ i;
        /*
         * Apply cut off threshold on initial update and
         * hide children depending on cut off depth.
         */
        if (this.isRendered === false && this.cutOffDepth > -1) {
            if (d.depth < this.cutOffDepth) {
                return true;
            } else if (d.depth == this.cutOffDepth) {
                d._children = d.children;
                d.children = null;
                return true;
            } else {
                return false;
            }
        }

        return true;
    }, this);

    this.isRendered = true;
    /*
     * Recalculate tree using new height.
     */
    this.tree.size([this.getCurrentHeight(), this.width]);
    nodes = this.tree.nodes(this.root);
    nodes.forEach(function(d) {
        /*
         * Normalize for fixed-depth.
         */
        d.y = d.depth * 180;
    })
    var links = this.tree.links(nodes);
    /*
     * Update the nodes.
     */
    var node = this.canvas.selectAll("g.node").data(nodes, function(d) {
        return d.id;
    });
    /*
     * Stash reference to this object.
     */
    var self = this;
    /*
     * Enter any new nodes at the parent's previous position.
     */
    var nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + ", " + source.x0 + ")";
        }).on("click", function(d) {
            if (("children" in d && d.children) || ("_children" in d && d._children)) {
                self.expandOrCollapse(d);
            } else {
                self.showModalWindow(d);
            }
        });
    /*
     * Add background arc.
     */
    nodeEnter.append("path")
        .attr("class", "radial-progress-backround")
        .attr("d", this.backgroundArc)
    /*
     * Add non transparent background circle.
     */
    nodeEnter.append("circle")
        .style("opacity", 0)
        .style("fill", "white")
        .attr("r", this.innerRadius)
    /*
     * Add outer progress arc.
     */
    nodeEnter.append("path")
        .attr("class", "radial-progress-outter")
        .attr("d", this.valueArc)
        .style("fill", function(d) {
            return self.getColor(d.value);
        })
    /*
     * Append node labels.
     */
    nodeEnter.append("text")
        .attr("class", "node-label")
        .style("opacity", 0)
        .attr("y", function(d) {
            return self.getLabelYPosition(d);
        }).attr("x", function(d) {
            return self.getLabelXPosition(d);
        }).attr("text-anchor", function(d) {
            return self.getLabelAnchor(d);
        }).text(function(d) {
            return d.name;
        });
    /*
     * Append node values.
     */
    nodeEnter.append("text")
        .attr("class", "node-value")
        .attr("font-size", this.fontSize)
        .style("opacity", 0)
        .attr("y", 0)
        .attr("dy", this.fontSize / 4)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .text("0%");
    /*
     * Transition nodes to their new position.
     */
    var nodeUpdate = node.transition()
        .duration(this.duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + ", " + d.x + ")";
        });
    /*
     * Animate outer progress arc.
     */
    nodeEnter.select(".radial-progress-outter")
        .transition()
        .duration(this.duration)
        .attrTween("d", function(d) {
            var i = d3.interpolate(0, (d.value > 100 ? 100 : d.value) * 3.6);
            return function(t) {
                return self.valueArc.endAngle(i(t) * (Math.PI / 180))();
            };
        })
    /*
     * Change node elements opacity.
     */
    nodeUpdate.select("circle").style("opacity", 1);
    nodeUpdate.select(".node-label").style("opacity", 1);
    /*
     * Run node value animation.
     */
    nodeEnter.select(".node-value")
        .transition()
        .duration(this.duration)
        .ease("linear")
        .style("opacity", 1)
        .tween("text", function(d) {
            var i = d3.interpolate(0, d.value > 100 ? 100 : d.value);
            return function(t) {
                this.textContent = Math.round(i(t)) + "%";
            };
        }).each("end", function(d) {
            if (d.value > 100) {
                /*
                 * Animate value more than 100%.
                 */
                d3.select(this)
                    .transition()
                    .duration(self.duration)
                    .ease("linear")
                    .tween("text", function(d) {
                        var i = d3.interpolate(100, d.value);
                        return function(t) {
                            this.textContent = Math.round(i(t)) + "%";
                        };
                    });
                /*
                 * Create inner ring arc.
                 */
                var innerArc = d3.svg.arc()
                    .outerRadius(self.innerRadius)
                    .innerRadius(self.innerRadius - (self.outerRadius - self.innerRadius))
                    .startAngle(0);
                /*
                 * Append inner ring arc and run transition.
                 */
                d3.select(d3.select(this).node().parentNode).append("path")
                    .attr("class", "radial-progress-inner")
                    .attr("d", innerArc)
                    .attr("opacity", 0.6)
                    .style("fill", function(d) {
                        return self.getColor(d.value);
                    }).transition()
                    .duration(self.duration)
                    .attrTween("d", function(d) {
                        var i = d3.interpolate(0, (d.value - 100) * 3.6);
                        return function(t) {
                            return innerArc.endAngle(i(t) * (Math.PI / 180))();
                        };
                    })
            }
        });
    /*
     * Transition exiting nodes to the parent's new position.
     */
    var nodeExit = node.exit()
        .transition()
        .duration(this.duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + ", " + source.x + ")";
        }).remove();
    /*
     * Fade collapsed nodes.
     */
    nodeExit.selectAll("text").style("opacity", 0);
    nodeExit.selectAll("path").style("opacity", 0);
    nodeExit.select("circle").style("opacity", 0);
    /*
     * Update the links.
     */
    var link = this.canvas.selectAll("path.link")
        .data(links, function(d) {
            return d.target.id;
        });
    /*
     * Enter any new links at the parent's previous position.
     */
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {
                x : source.x0,
                y : source.y0
            };
            return self.diagonal({
                source : o,
                target : o
            });
        });
    /*
     * Transition links to their new position.
     */
    link.transition()
        .duration(this.duration)
        .attr("d", self.diagonal);
    /*
     * Transition exiting nodes to the parent's new position.
     */
    link.exit().transition().duration(this.duration).attr("d", function(d) {
        var o = {
            x : source.x,
            y : source.y
        };
        return self.diagonal({
            source : o,
            target : o
        });
    }).remove();
    /*
     * Stash the old positions for transition.
     */
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}


/**
 * Get node label x position.
 * @param {Object} node
 * @returns {Number}
 */
Tree.prototype.getLabelXPosition = function(node) {

    var labelShift = this.outerRadius + 5;

    if (this.labelPosition == "top") {
        return 0;
    } else if (this.labelPosition == "bottom") {
        return 0;
    } else {
        return node.children || node._children ? - labelShift : labelShift;
    }
}


/**
 * Get node label y position.
 * @param {Object} node
 * @returns {Number}
 */
Tree.prototype.getLabelYPosition = function(node) {

    var labelShift = this.outerRadius + 5;

    if (this.labelPosition == "top") {
        return - labelShift;
    } else if (this.labelPosition == "bottom") {
        return labelShift + this.fontSize / 2;
    } else {
        return 0;
    }
}


/**
 * Get node label anchor.
 * @param {Object} node
 * @returns {String}
 */
Tree.prototype.getLabelAnchor = function(node) {

    if (this.labelPosition == "top") {
        return "middle";
    } else if (this.labelPosition == "bottom") {
        return "middle";
    } else {
        return node.children || node._children ? "end" : "start";
    }
}


/**
 * Show modal window.
 * @param {Object} d
 */
Tree.prototype.showModalWindow = function(d) {

    jQuery("#modal-window").modal();
}


/**
 * Expand or collapse node.
 * @param {Object} d
 */
Tree.prototype.expandOrCollapse = function(d) {

    var isRequireUpdate = ("children" in d && d.children) ||
        ("_children" in d && d._children);

    if (d.children) {
        d._children = d.children;
        this.state[d.depth + 1] -= d.children.length;
        d.children = null;
    } else {
        d.children = d._children;
        this.state[d.depth + 1] += d.children.length;
        d._children = null;
    }

    if (isRequireUpdate) {
        this.update(d);
    }
}


/**
 * Set SVG element height.
 * @param {Number} height
 * @returns {Tree}
 */
Tree.prototype.setHeight = function(height) {

    this.height = height;
    return this;
}


/**
 * Set graph height hierarchy.
 * Method accept variable list of parameters and keep them as array.
 * Each element of array denote SVG and its container height on each level
 * where children are expanded.
 * @returns {Tree}
 */
Tree.prototype.setHeightHierarchy = function() {

  this.heightHierarchy = d3.values(arguments);
  this.height = this.heightHierarchy[0];
  return this;
}


/**
 * Render graph.
 * @param {String} selector
 */
Tree.prototype.render = function(selector) {
    /*
     * Create radial diagram value arc.
     */
    this.valueArc = d3.svg.arc()
        .innerRadius(this.innerRadius)
        .outerRadius(this.outerRadius)
        .startAngle(0);
    /*
     * Create radial diagram background arc.
     */
    this.backgroundArc = d3.svg.arc()
        .innerRadius(this.innerRadius)
        .outerRadius(this.outerRadius)
        .startAngle(0)
        .endAngle(Math.PI * 2);
    /*
     * Calculate value label font size.
     */
    this.fontSize = this.innerRadius * this.fontSizeCoef;
    /*
     * Get graph container and calculate its size.
     */
    this.container = d3.select(selector);
    var dimension = this.container.node().getBoundingClientRect();
    /*
     * Set chart width.
     */
    this.width  = dimension.width - this.margin.right - this.margin.left;
    /*
     * Set chart height.
     */
    if (! this.height) {
        this.height = 400 - this.margin.top - this.margin.bottom;
    }
    /*
     * Create tree layout.
     */
    this.tree = d3.layout.tree().size([this.height, this.width]);
    /*
     * Create SVG element.
     */
    this.svg = this.container.append("svg")
        .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
    /*
     * Create graph canvas.
     */
    this.canvas = this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")");
    /*
     * Stash reference to this object.
     */
    var self = this;
    /*
     * Load data.
     */
    d3.json(this.url, function(error, treeData) {
        /*
         * Log error if any.
         */
        if (error) {
            console.error(error);
            return;
        };
        /*
         * Get root node and update it.
         */
        self.root = treeData[0];
        self.root.x0 = self.height / 2;
        self.root.y0 = 0;
        /*
         * Run chart re/rendering.
         */
        self.update(self.root);
    });

    return this;
}