import './style.scss';
import './editor.scss';

const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;

registerBlockType( 'advanced-blocks/advance-posts', {
	title: __( 'Advance Posts' ),
	icon: 'shield',
	category: 'common',
	keywords: [
		__( 'Advance posts' ),
		__( 'Post' ),
		__( 'Posts' ),
	],

	edit: function( props ) {
		return (
			<div className={ props.className }>
				Render content
			</div>
		);
	},

	save: function( props ) {
		return (
			<div>
				Save content
			</div>
		);
	},
} );
