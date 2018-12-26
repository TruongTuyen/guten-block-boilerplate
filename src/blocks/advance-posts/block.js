import './style.scss';
import './editor.scss';
import classnames from 'classnames';

const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;
const { isUndefined, pickBy } = lodash;
const { Component, Fragment } = wp.element;

const {
	PanelBody,
	Placeholder,
	QueryControls,
	RangeControl,
	Spinner,
	ToggleControl,
	Toolbar,
	Button,
	Popover
} = wp.components;
const {
	InspectorControls,
	BlockAlignmentToolbar,
	BlockControls,
} = wp.editor;

const { withSelect } = wp.data;
const { withState } = wp.compose;

const MAX_POSTS_COLUMNS = 6;

class AdvancePostsEdit extends Component{
	constructor() {
		super( ...arguments );
		this.toggleDisplayPostDate = this.toggleDisplayPostDate.bind( this );

		this.state = {
			openPopover: false,
			mustOpen: false
		};
	}

	toggleDisplayPostDate() {
		const { displayPostDate } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostDate: ! displayPostDate } );
		
	}

	openPopover( e) {
		if( e.target.classList.contains('open-popover-content') ) {
			this.setState({
				openPopover: !this.state.openPopover,
				mustOpen: true
			});
		}
	}

	closePopover(e) {
		if( e.target.classList.contains('btn-close-popover') ) {
			this.setState({
				openPopover: false,
				mustOpen: false
			});
		}
	}

	clickOutsidePopover() {
		this.setState({
			openPopover: false,
			mustOpen: false
		});
	}


	render() {
		const { attributes, categoriesList, setAttributes, advancedPosts } = this.props;
		const { displayPostDate, align, postLayout, columns, order, orderBy, categories, postsToShow } = attributes;

		const PopoverChild = () => {
			return (
				<Fragment>
					<ToggleControl
						label={ __( 'Display post date' ) }
						checked={ displayPostDate }
						onChange={ this.toggleDisplayPostDate }
					/>
					<Button isDefault onClick={ this.closePopover.bind(this) } className="btn-close-popover">Close Popover</Button>
				</Fragment>
			);
		};

		const MyPopover = () => {
			var openPopover = this.state.openPopover;
			var mustOpen = this.state.mustOpen;
			console.log( 'open popover', openPopover );
			return (
				<Button isDefault onClick={ this.openPopover.bind(this) } className="open-popover-content">
					Toggle Popover!
					{ (mustOpen || openPopover) && (
						<Popover position="bottom" children={<PopoverChild/>} onClickOutside={this.clickOutsidePopover.bind(this)}>
							
						</Popover>
					) }
				</Button>
			);
		};

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Advanced Posts Settings' ) }>
					<MyPopover/>
					<QueryControls
						{ ...{ order, orderBy } }
						numberOfItems={ postsToShow }
						categoriesList={ categoriesList }
						selectedCategoryId={ categories }
						onOrderChange={ ( value ) => setAttributes( { order: value } ) }
						onOrderByChange={ ( value ) => setAttributes( { orderBy: value } ) }
						onCategoryChange={ ( value ) => setAttributes( { categories: '' !== value ? value : undefined } ) }
						onNumberOfItemsChange={ ( value ) => setAttributes( { postsToShow: value } ) }
					/>
					<ToggleControl
						label={ __( 'Display post date' ) }
						checked={ displayPostDate }
						onChange={ this.toggleDisplayPostDate }
					/>
					{ postLayout === 'grid' &&
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( value ) => setAttributes( { columns: value } ) }
							min={ 2 }
							max={ ! hasPosts ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, advancedPosts.length ) }
						/>
					}
				</PanelBody>
			</InspectorControls>
		);

		const hasPosts = Array.isArray( advancedPosts ) && advancedPosts.length;
		if ( ! hasPosts ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Advanced Posts' ) }
					>
						{ ! Array.isArray( advancedPosts ) ?
							<Spinner /> :
							__( 'No posts found.' )
						}
					</Placeholder>
				</Fragment>
			);
		}
		const displayPosts = advancedPosts.length > postsToShow ? advancedPosts.slice( 0, postsToShow ) : advancedPosts;

		const layoutControls = [
			{
				icon: 'list-view',
				title: __( 'List View' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid View' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		return (
			<Fragment>
				{ inspectorControls }
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
						controls={ [ 'center', 'wide', 'full' ] }
					/>
					<Toolbar controls={ layoutControls } />
				</BlockControls>
				<ul
					className={ classnames( this.props.className, {
						'is-grid': postLayout === 'grid',
						[ `columns-${ columns }` ]: postLayout === 'grid',
					} ) }
				>
					{ displayPosts.map( ( post, i ) =>
						<li key={ i }>
							<a href={ post.link } target="_blank">{ post.title.rendered.trim() || __( '(Untitled)' ) }</a>
							
						</li>
					) }
				</ul>
			</Fragment>
		);

	}
}

registerBlockType( 'advanced-blocks/advance-posts', {
	title: __( 'Advance Posts' ),
	icon: 'shield',
	category: 'common',
	keywords: [
		__( 'Advance posts' ),
		__( 'Post' ),
		__( 'Posts' ),
	],

	edit: withSelect( (select, props) => {
		const { getEntityRecords } = select("core");
		const {
			numberPosts,
			order,
			orderBy,
			category,
		} = props.attributes;

		const advancePostsQuery = pickBy(
			{
				categories: category,
				order,
				orderby: orderBy,
				per_page: numberPosts
			},
			value => !isUndefined(value)
		);

		const categoriesListQuery = {
			per_page: 99
		};

		return {
			advancedPosts: getEntityRecords(
				"postType",
				"post",
				advancePostsQuery
			),
			categoriesList: getEntityRecords(
				"taxonomy",
				"category",
				categoriesListQuery
			)
		};

	})(AdvancePostsEdit),

	save: function( ) {
		return null;
	},
} );

