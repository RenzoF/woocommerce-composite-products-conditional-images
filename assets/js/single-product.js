;( function ( $, window, document, undefined ) {

	$( '.composite_data' ).on( 'wc-composite-initializing', function( event, composite ) {

		function Overlay_Image_App() {

			/**
			 * Track changes to 'Overlay Image' scenarios.
			 */
			var Overlay_Image_Model = function( opts ) {

				var Model = Backbone.Model.extend( {

					initialize: function( options ) {

						composite.actions.add_action( 'active_scenarios_updated', this.component_selection_changed_handler, 20, this );

						var params = {
							active_scenarios: [],
						};

						this.set( params );
					},

					component_selection_changed_handler: function( step ) {

						var active_scenarios       = composite.scenarios.get_active_scenarios_by_type( 'overlay_image' ),
							shaping_components     = composite.scenarios.get_scenario_shaping_components(),
							non_shaping_components = _.difference( _.pluck( composite.get_components(), 'component_id' ), shaping_components );

						/*
						 * Filter out any scenarios containing components that:
						 * - are not masked; AND
						 * - are not scenario-shaping.
						 */
						for ( var index = 0, length = non_shaping_components.length; index < length; index++ ) {
							active_scenarios = _.difference( active_scenarios, composite.scenarios.get_unmasked_scenarios( active_scenarios, non_shaping_components[ index ] ) );
						}

						this.set( { active_scenarios: active_scenarios } );
					}

				} );

				var obj = new Model( opts );
				return obj;
			};

			/**
			 * Render overlays.
			 */
			var Overlay_Image_View = function( opts ) {

				var View = Backbone.View.extend( {

					$main_image: false,
					$gallery: false,

					initialize: function( options ) {

						this.$main_image = this.$el.find( '.woocommerce-product-gallery__image' ).first();
						this.$gallery    = this.$el.closest( '.woocommerce-product-gallery' );

						this.listenTo( this.model, 'change:active_scenarios', this.render );
					},

					render: function() {

						var active_scenarios = this.model.get( 'active_scenarios' ),
							gallery_width    = this.$gallery.innerWidth(),
							overlay_css      = { width: gallery_width, position: 'absolute' };

						// Remove overlays.
						this.$main_image.find( '.wc-cp-overlay-image' ).remove();

						for ( var index = active_scenarios.length - 1; index >= 0; index-- ) {

							var scenario_id = active_scenarios[ index ],
								image_html  = composite.scenarios.get_scenario_data().scenario_settings.overlay_image[ scenario_id ],
								$image_html = $( image_html ).css( overlay_css );

							if ( image_html ) {
								this.$main_image.prepend( $image_html );
							}
						}
					}

				} );

				var obj = new View( opts );
				return obj;
			};

			/**
			 * Initialize app.
			 */
			this.initialize = function() {

				var $images_wrapper = $( '.woocommerce-product-gallery__wrapper' ).first();

				if ( $images_wrapper.length > 0 ) {
					this.model = new Overlay_Image_Model();
					this.view = new Overlay_Image_View( { model: this.model, el: $images_wrapper } );
				}

			};
		}

		var app = new Overlay_Image_App();

		app.initialize();

	} );

} ) ( jQuery, window, document );